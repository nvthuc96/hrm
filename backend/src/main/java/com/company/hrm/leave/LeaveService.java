package com.company.hrm.leave;

import com.company.hrm.common.BusinessException;
import com.company.hrm.common.ResourceNotFoundException;
import com.company.hrm.employee.domain.Employee;
import com.company.hrm.employee.repository.EmployeeRepository;
import com.company.hrm.leave.domain.LeaveBalance;
import com.company.hrm.leave.domain.LeaveRequest;
import com.company.hrm.leave.domain.LeaveStatus;
import com.company.hrm.leave.domain.LeaveType;
import com.company.hrm.leave.dto.LeaveBalanceResponse;
import com.company.hrm.leave.dto.LeaveRequestCreate;
import com.company.hrm.leave.dto.LeaveRequestResponse;
import com.company.hrm.leave.repository.LeaveBalanceRepository;
import com.company.hrm.leave.repository.LeaveRequestRepository;
import com.company.hrm.leave.repository.LeaveTypeRepository;
import com.company.hrm.notification.NotificationService;
import com.company.hrm.notification.domain.NotificationType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class LeaveService {

    private static final Set<String> APPROVER_ROLES = Set.of("ROLE_ADMIN", "ROLE_HR", "ROLE_MANAGER");

    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final EmployeeRepository employeeRepository;
    private final NotificationService notificationService;

    public LeaveService(LeaveRequestRepository leaveRequestRepository,
                        LeaveBalanceRepository leaveBalanceRepository,
                        LeaveTypeRepository leaveTypeRepository,
                        EmployeeRepository employeeRepository,
                        NotificationService notificationService) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.leaveBalanceRepository = leaveBalanceRepository;
        this.leaveTypeRepository = leaveTypeRepository;
        this.employeeRepository = employeeRepository;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestResponse> search(Long employeeId, LeaveStatus status) {
        return leaveRequestRepository.search(employeeId, status).stream()
                .map(LeaveMapper::toResponse)
                .toList();
    }

    public LeaveRequestResponse create(LeaveRequestCreate req) {
        if (req.endDate().isBefore(req.startDate())) {
            throw new BusinessException("Ngày kết thúc phải sau ngày bắt đầu");
        }
        Employee employee = employeeRepository.findById(req.employeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Employee", req.employeeId()));
        LeaveType type = leaveTypeRepository.findById(req.leaveTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("LeaveType", req.leaveTypeId()));

        int days = (int) (ChronoUnit.DAYS.between(req.startDate(), req.endDate()) + 1);

        LeaveRequest r = new LeaveRequest();
        r.setEmployee(employee);
        r.setLeaveType(type);
        r.setStartDate(req.startDate());
        r.setEndDate(req.endDate());
        r.setDays(days);
        r.setReason(req.reason());
        r.setStatus(LeaveStatus.PENDING);
        LeaveRequest saved = leaveRequestRepository.save(r);

        notificationService.notifyRoles(APPROVER_ROLES, NotificationType.LEAVE_SUBMITTED,
                "Đơn nghỉ mới cần duyệt",
                employee.getFullName() + " xin nghỉ " + saved.getStartDate() + " → "
                        + saved.getEndDate() + " (" + saved.getDays() + " ngày)",
                "/leaves?status=PENDING");

        return LeaveMapper.toResponse(saved);
    }

    public LeaveRequestResponse approve(Long id) {
        LeaveRequest r = findPending(id);
        LeaveType type = r.getLeaveType();

        // Deduct balance only for paid types that have an annual entitlement.
        if (type.isPaid() && type.getMaxDaysPerYear() > 0) {
            int year = r.getStartDate().getYear();
            LeaveBalance balance = leaveBalanceRepository
                    .findByEmployeeIdAndLeaveTypeIdAndYear(r.getEmployee().getId(), type.getId(), year)
                    .orElseGet(() -> initBalance(r.getEmployee(), type, year));

            if (balance.getRemaining() < r.getDays()) {
                throw new BusinessException("Không đủ số dư phép: còn " + balance.getRemaining()
                        + " ngày, cần " + r.getDays() + " ngày");
            }
            balance.setUsed(balance.getUsed() + r.getDays());
            balance.setRemaining(balance.getEntitled() - balance.getUsed());
            leaveBalanceRepository.save(balance);
        }

        r.setStatus(LeaveStatus.APPROVED);
        LeaveRequest saved = leaveRequestRepository.save(r);

        notificationService.notifyEmployee(saved.getEmployee().getId(), NotificationType.LEAVE_APPROVED,
                "Đơn nghỉ đã được duyệt",
                "Đơn nghỉ " + saved.getStartDate() + " → " + saved.getEndDate() + " đã được duyệt.",
                "/my-leaves");

        return LeaveMapper.toResponse(saved);
    }

    public LeaveRequestResponse reject(Long id, String note) {
        LeaveRequest r = findPending(id);
        r.setStatus(LeaveStatus.REJECTED);
        String trimmed = note != null && !note.isBlank() ? note.trim() : null;
        r.setDecisionNote(trimmed);
        LeaveRequest saved = leaveRequestRepository.save(r);

        String msg = "Đơn nghỉ " + saved.getStartDate() + " → " + saved.getEndDate() + " bị từ chối."
                + (trimmed != null ? " Lý do: " + trimmed : "");
        notificationService.notifyEmployee(saved.getEmployee().getId(), NotificationType.LEAVE_REJECTED,
                "Đơn nghỉ bị từ chối", msg, "/my-leaves");

        return LeaveMapper.toResponse(saved);
    }

    public LeaveRequestResponse cancel(Long id) {
        LeaveRequest r = findPending(id);
        r.setStatus(LeaveStatus.CANCELLED);
        return LeaveMapper.toResponse(leaveRequestRepository.save(r));
    }

    /** Cancel a pending request, but only if it belongs to the given employee. */
    public LeaveRequestResponse cancelForEmployee(Long id, Long employeeId) {
        LeaveRequest r = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", id));
        if (!r.getEmployee().getId().equals(employeeId)) {
            throw new BusinessException("Bạn chỉ có thể hủy đơn nghỉ của chính mình");
        }
        if (r.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessException("Chỉ hủy được đơn đang chờ duyệt (PENDING)");
        }
        r.setStatus(LeaveStatus.CANCELLED);
        return LeaveMapper.toResponse(leaveRequestRepository.save(r));
    }

    @Transactional(readOnly = true)
    public List<LeaveBalanceResponse> balances(Long employeeId, int year) {
        List<LeaveBalance> existing = leaveBalanceRepository.findByEmployeeIdAndYear(employeeId, year);
        List<LeaveBalanceResponse> result = new ArrayList<>();
        for (LeaveType type : leaveTypeRepository.findAll()) {
            LeaveBalance b = existing.stream()
                    .filter(x -> x.getLeaveType().getId().equals(type.getId()))
                    .findFirst()
                    .orElse(null);
            if (b != null) {
                result.add(LeaveMapper.toResponse(b));
            } else {
                int entitled = type.getMaxDaysPerYear();
                result.add(new LeaveBalanceResponse(type.getId(), type.getName(), year, entitled, 0, entitled));
            }
        }
        return result;
    }

    private LeaveBalance initBalance(Employee employee, LeaveType type, int year) {
        LeaveBalance b = new LeaveBalance();
        b.setEmployee(employee);
        b.setLeaveType(type);
        b.setYear(year);
        b.setEntitled(type.getMaxDaysPerYear());
        b.setUsed(0);
        b.setRemaining(type.getMaxDaysPerYear());
        return b;
    }

    private LeaveRequest findPending(Long id) {
        LeaveRequest r = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveRequest", id));
        if (r.getStatus() != LeaveStatus.PENDING) {
            throw new BusinessException("Chỉ xử lý được đơn đang chờ duyệt (PENDING)");
        }
        return r;
    }
}
