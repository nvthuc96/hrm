package com.company.hrm.payroll;

import com.company.hrm.common.ResourceNotFoundException;
import com.company.hrm.payroll.domain.SalaryComponent;
import com.company.hrm.payroll.dto.SalaryComponentRequest;
import com.company.hrm.payroll.dto.SalaryComponentResponse;
import com.company.hrm.payroll.repository.SalaryComponentRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SalaryComponentService {

  private final SalaryComponentRepository repository;

  public SalaryComponentService(SalaryComponentRepository repository) {
    this.repository = repository;
  }

  @Transactional(readOnly = true)
  public List<SalaryComponentResponse> findAll() {
    return repository.findAll().stream().map(PayrollMapper::toResponse).toList();
  }

  public SalaryComponentResponse create(SalaryComponentRequest req) {
    SalaryComponent c = new SalaryComponent();
    apply(req, c);
    return PayrollMapper.toResponse(repository.save(c));
  }

  public SalaryComponentResponse update(Long id, SalaryComponentRequest req) {
    SalaryComponent c =
        repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("SalaryComponent", id));
    apply(req, c);
    return PayrollMapper.toResponse(repository.save(c));
  }

  public void delete(Long id) {
    SalaryComponent c =
        repository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("SalaryComponent", id));
    repository.delete(c);
  }

  private void apply(SalaryComponentRequest req, SalaryComponent c) {
    c.setName(req.name());
    c.setType(req.type());
    c.setTaxable(req.taxable());
    c.setDefaultAmount(req.defaultAmount());
  }
}
