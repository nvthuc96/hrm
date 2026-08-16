package com.company.hrm.employee;

import com.company.hrm.common.BusinessException;
import com.company.hrm.common.PageResponse;
import com.company.hrm.common.ResourceNotFoundException;
import com.company.hrm.employee.domain.Department;
import com.company.hrm.employee.domain.Employee;
import com.company.hrm.employee.domain.EmployeeStatus;
import com.company.hrm.employee.domain.Position;
import com.company.hrm.employee.dto.EmployeeRequest;
import com.company.hrm.employee.dto.EmployeeResponse;
import com.company.hrm.employee.repository.DepartmentRepository;
import com.company.hrm.employee.repository.EmployeeRepository;
import com.company.hrm.employee.repository.PositionRepository;
import com.company.hrm.export.ExcelExporter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final PositionRepository positionRepository;

    public EmployeeService(EmployeeRepository employeeRepository,
                           DepartmentRepository departmentRepository,
                           PositionRepository positionRepository) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.positionRepository = positionRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<EmployeeResponse> search(String q, Long departmentId, Pageable pageable) {
        Page<EmployeeResponse> page = employeeRepository
                .search(q, departmentId, pageable)
                .map(EmployeeMapper::toResponse);
        return PageResponse.from(page);
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getById(Long id) {
        return EmployeeMapper.toResponse(findOrThrow(id));
    }

    /** All employees matching the filter (unpaged) as an .xlsx workbook. */
    @Transactional(readOnly = true)
    public byte[] exportXlsx(String q, Long departmentId) {
        List<List<Object>> rows = employeeRepository.search(q, departmentId, Pageable.unpaged())
                .map(EmployeeMapper::toResponse)
                .stream()
                .map(e -> List.<Object>of(
                        nz(e.employeeCode()),
                        nz(e.fullName()),
                        nz(e.departmentName()),
                        nz(e.positionName()),
                        nz(e.email()),
                        nz(e.phone()),
                        e.dob() != null ? e.dob() : "",
                        genderLabel(e.gender()),
                        e.hireDate() != null ? e.hireDate() : "",
                        statusLabel(e.status())))
                .toList();

        List<String> headers = List.of(
                "Mã NV", "Họ tên", "Phòng ban", "Chức danh", "Email", "Số điện thoại",
                "Ngày sinh", "Giới tính", "Ngày vào làm", "Trạng thái");
        return ExcelExporter.toXlsx("Nhân viên", headers, rows);
    }

    private static Object nz(Object v) {
        return v != null ? v : "";
    }

    private static String genderLabel(String g) {
        if (g == null) return "";
        return switch (g) {
            case "MALE" -> "Nam";
            case "FEMALE" -> "Nữ";
            case "OTHER" -> "Khác";
            default -> g;
        };
    }

    private static String statusLabel(EmployeeStatus s) {
        if (s == null) return "";
        return switch (s) {
            case ACTIVE -> "Đang làm việc";
            case ON_LEAVE -> "Đang nghỉ";
            case TERMINATED -> "Đã nghỉ việc";
        };
    }

    public EmployeeResponse create(EmployeeRequest req) {
        if (employeeRepository.existsByEmployeeCode(req.employeeCode())) {
            throw new BusinessException("Employee code already exists: " + req.employeeCode());
        }
        Employee e = new Employee();
        apply(req, e);
        return EmployeeMapper.toResponse(employeeRepository.save(e));
    }

    public EmployeeResponse update(Long id, EmployeeRequest req) {
        Employee e = findOrThrow(id);
        if (!e.getEmployeeCode().equals(req.employeeCode())
                && employeeRepository.existsByEmployeeCode(req.employeeCode())) {
            throw new BusinessException("Employee code already exists: " + req.employeeCode());
        }
        apply(req, e);
        return EmployeeMapper.toResponse(employeeRepository.save(e));
    }

    public void delete(Long id) {
        Employee e = findOrThrow(id);
        employeeRepository.delete(e);
    }

    private void apply(EmployeeRequest req, Employee e) {
        e.setEmployeeCode(req.employeeCode());
        e.setFullName(req.fullName());
        e.setDob(req.dob());
        e.setGender(req.gender());
        e.setNationalId(req.nationalId());
        e.setEmail(req.email());
        e.setPhone(req.phone());
        e.setAddress(req.address());
        e.setManagerId(req.managerId());
        e.setHireDate(req.hireDate());
        e.setStatus(req.status() != null ? req.status() : EmployeeStatus.ACTIVE);
        e.setDepartment(resolveDepartment(req.departmentId()));
        e.setPosition(resolvePosition(req.positionId()));
    }

    private Department resolveDepartment(Long id) {
        if (id == null) return null;
        return departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", id));
    }

    private Position resolvePosition(Long id) {
        if (id == null) return null;
        return positionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Position", id));
    }

    private Employee findOrThrow(Long id) {
        return employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", id));
    }
}
