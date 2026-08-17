package com.company.hrm.payroll;

import com.company.hrm.attendance.domain.AttendanceStatus;
import com.company.hrm.attendance.repository.AttendanceRepository;
import com.company.hrm.common.BusinessException;
import com.company.hrm.common.ResourceNotFoundException;
import com.company.hrm.employee.domain.Employee;
import com.company.hrm.employee.domain.EmployeeStatus;
import com.company.hrm.employee.domain.EmploymentContract;
import com.company.hrm.employee.repository.EmployeeRepository;
import com.company.hrm.employee.repository.EmploymentContractRepository;
import com.company.hrm.export.ExcelExporter;
import com.company.hrm.payroll.domain.ComponentType;
import com.company.hrm.payroll.domain.PayrollPeriod;
import com.company.hrm.payroll.domain.Payslip;
import com.company.hrm.payroll.domain.PayslipDetail;
import com.company.hrm.payroll.domain.PeriodStatus;
import com.company.hrm.payroll.domain.SalaryComponent;
import com.company.hrm.payroll.dto.PayrollPeriodResponse;
import com.company.hrm.payroll.dto.PayslipResponse;
import com.company.hrm.payroll.repository.PayrollPeriodRepository;
import com.company.hrm.payroll.repository.PayslipRepository;
import com.company.hrm.payroll.repository.SalaryComponentRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PayrollService {

  /** Simplified assumptions for the MVP payroll engine. */
  private static final BigDecimal STANDARD_DAYS = new BigDecimal("22");

  private static final BigDecimal INSURANCE_RATE =
      new BigDecimal("0.105"); // BHXH+BHYT+BHTN (nhân viên)
  private static final BigDecimal PERSONAL_DEDUCTION =
      new BigDecimal("11000000"); // giảm trừ bản thân
  private static final BigDecimal TAX_RATE =
      new BigDecimal("0.10"); // thuế TNCN đơn giản hóa (flat)

  private final PayrollPeriodRepository periodRepository;
  private final PayslipRepository payslipRepository;
  private final SalaryComponentRepository componentRepository;
  private final EmployeeRepository employeeRepository;
  private final EmploymentContractRepository contractRepository;
  private final AttendanceRepository attendanceRepository;

  public PayrollService(
      PayrollPeriodRepository periodRepository,
      PayslipRepository payslipRepository,
      SalaryComponentRepository componentRepository,
      EmployeeRepository employeeRepository,
      EmploymentContractRepository contractRepository,
      AttendanceRepository attendanceRepository) {
    this.periodRepository = periodRepository;
    this.payslipRepository = payslipRepository;
    this.componentRepository = componentRepository;
    this.employeeRepository = employeeRepository;
    this.contractRepository = contractRepository;
    this.attendanceRepository = attendanceRepository;
  }

  // ---------- Periods ----------

  @Transactional(readOnly = true)
  public List<PayrollPeriodResponse> listPeriods() {
    return periodRepository.findAllByOrderByYearDescMonthDesc().stream()
        .map(PayrollMapper::toResponse)
        .toList();
  }

  public PayrollPeriodResponse createPeriod(int month, int year) {
    periodRepository
        .findByMonthAndYear(month, year)
        .ifPresent(
            p -> {
              throw new BusinessException("Kỳ lương " + month + "/" + year + " đã tồn tại");
            });
    PayrollPeriod p = new PayrollPeriod();
    p.setMonth(month);
    p.setYear(year);
    p.setStatus(PeriodStatus.OPEN);
    return PayrollMapper.toResponse(periodRepository.save(p));
  }

  public PayrollPeriodResponse setStatus(Long periodId, PeriodStatus status) {
    PayrollPeriod p =
        periodRepository
            .findById(periodId)
            .orElseThrow(() -> new ResourceNotFoundException("PayrollPeriod", periodId));
    p.setStatus(status);
    return PayrollMapper.toResponse(periodRepository.save(p));
  }

  // ---------- Payslips ----------

  @Transactional(readOnly = true)
  public List<PayslipResponse> listPayslips(Long periodId) {
    return payslipRepository.findByPeriodIdOrderByEmployee_FullName(periodId).stream()
        .map(PayrollMapper::toResponse)
        .toList();
  }

  @Transactional(readOnly = true)
  public PayslipResponse getPayslip(Long id) {
    return PayrollMapper.toResponse(
        payslipRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Payslip", id)));
  }

  /** All payslips of a period as an .xlsx workbook. */
  @Transactional(readOnly = true)
  public byte[] exportXlsx(Long periodId) {
    PayrollPeriod period =
        periodRepository
            .findById(periodId)
            .orElseThrow(() -> new ResourceNotFoundException("PayrollPeriod", periodId));

    List<List<Object>> rows =
        listPayslips(periodId).stream()
            .map(
                p ->
                    List.<Object>of(
                        p.employeeName(),
                        p.month() + "/" + p.year(),
                        p.workingDays(),
                        p.baseSalary(),
                        p.totalAllowance(),
                        p.totalDeduction(),
                        p.gross(),
                        p.insurance(),
                        p.tax(),
                        p.netSalary()))
            .toList();

    List<String> headers =
        List.of(
            "Nhân viên",
            "Kỳ",
            "Ngày công",
            "Lương cơ bản",
            "Tổng phụ cấp",
            "Tổng khấu trừ",
            "Gross",
            "BHXH",
            "Thuế TNCN",
            "Thực nhận");
    return ExcelExporter.toXlsx(
        "Bảng lương " + period.getMonth() + "-" + period.getYear(), headers, rows);
  }

  /** Human-friendly period label (e.g. "8-2026") for building filenames. */
  @Transactional(readOnly = true)
  public String periodLabel(Long periodId) {
    PayrollPeriod p =
        periodRepository
            .findById(periodId)
            .orElseThrow(() -> new ResourceNotFoundException("PayrollPeriod", periodId));
    return p.getMonth() + "-" + p.getYear();
  }

  /** Generate payslips for every active employee in the period (regenerates existing ones). */
  public List<PayslipResponse> generateAll(Long periodId) {
    PayrollPeriod period = openPeriod(periodId);
    List<SalaryComponent> components = componentRepository.findAll();
    return employeeRepository.findAll().stream()
        .filter(e -> e.getStatus() == EmployeeStatus.ACTIVE)
        .map(e -> PayrollMapper.toResponse(buildPayslip(e, period, components)))
        .toList();
  }

  public PayslipResponse generateOne(Long periodId, Long employeeId) {
    PayrollPeriod period = openPeriod(periodId);
    Employee employee =
        employeeRepository
            .findById(employeeId)
            .orElseThrow(() -> new ResourceNotFoundException("Employee", employeeId));
    return PayrollMapper.toResponse(buildPayslip(employee, period, componentRepository.findAll()));
  }

  private Payslip buildPayslip(
      Employee employee, PayrollPeriod period, List<SalaryComponent> components) {
    // Replace any existing payslip so regeneration is idempotent.
    payslipRepository
        .findByEmployeeIdAndPeriodId(employee.getId(), period.getId())
        .ifPresent(payslipRepository::delete);
    payslipRepository.flush();

    BigDecimal baseSalary =
        contractRepository
            .findFirstByEmployeeIdAndStatusOrderByStartDateDesc(employee.getId(), "ACTIVE")
            .map(EmploymentContract::getBaseSalary)
            .orElse(BigDecimal.ZERO);

    YearMonth ym = YearMonth.of(period.getYear(), period.getMonth());
    LocalDate from = ym.atDay(1);
    LocalDate to = ym.atEndOfMonth();
    int workingDays =
        (int)
            attendanceRepository.countByEmployeeIdAndStatusAndWorkDateBetween(
                employee.getId(), AttendanceStatus.PRESENT, from, to);

    // Pro-rate base by attendance (capped at a full month).
    BigDecimal ratio =
        BigDecimal.valueOf(workingDays)
            .divide(STANDARD_DAYS, 4, RoundingMode.HALF_UP)
            .min(BigDecimal.ONE);
    BigDecimal proratedBase = scale(baseSalary.multiply(ratio));

    Payslip slip = new Payslip();
    slip.setEmployee(employee);
    slip.setPeriod(period);
    slip.setWorkingDays(workingDays);
    slip.setBaseSalary(proratedBase);

    BigDecimal totalAllowance = BigDecimal.ZERO;
    BigDecimal taxableAllowance = BigDecimal.ZERO;
    BigDecimal totalDeduction = BigDecimal.ZERO;

    for (SalaryComponent c : components) {
      PayslipDetail d = new PayslipDetail();
      d.setComponent(c);
      d.setName(c.getName());
      d.setType(c.getType());
      d.setAmount(c.getDefaultAmount());
      slip.addDetail(d);

      if (c.getType() == ComponentType.ALLOWANCE) {
        totalAllowance = totalAllowance.add(c.getDefaultAmount());
        if (c.isTaxable()) {
          taxableAllowance = taxableAllowance.add(c.getDefaultAmount());
        }
      } else {
        totalDeduction = totalDeduction.add(c.getDefaultAmount());
      }
    }

    BigDecimal gross = proratedBase.add(totalAllowance);
    BigDecimal insurance = scale(proratedBase.multiply(INSURANCE_RATE));
    BigDecimal taxableIncome =
        proratedBase.add(taxableAllowance).subtract(insurance).subtract(PERSONAL_DEDUCTION);
    BigDecimal tax =
        taxableIncome.signum() > 0 ? scale(taxableIncome.multiply(TAX_RATE)) : BigDecimal.ZERO;
    BigDecimal net = gross.subtract(totalDeduction).subtract(insurance).subtract(tax);

    slip.setTotalAllowance(scale(totalAllowance));
    slip.setTotalDeduction(scale(totalDeduction));
    slip.setGross(scale(gross));
    slip.setInsurance(insurance);
    slip.setTax(tax);
    slip.setNetSalary(scale(net));

    return payslipRepository.save(slip);
  }

  private PayrollPeriod openPeriod(Long periodId) {
    PayrollPeriod period =
        periodRepository
            .findById(periodId)
            .orElseThrow(() -> new ResourceNotFoundException("PayrollPeriod", periodId));
    if (period.getStatus() == PeriodStatus.LOCKED) {
      throw new BusinessException("Kỳ lương đã khóa, không thể tính lại");
    }
    return period;
  }

  private static BigDecimal scale(BigDecimal v) {
    return v.setScale(2, RoundingMode.HALF_UP);
  }
}
