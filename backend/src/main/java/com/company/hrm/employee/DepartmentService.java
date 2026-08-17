package com.company.hrm.employee;

import com.company.hrm.common.ResourceNotFoundException;
import com.company.hrm.employee.domain.Department;
import com.company.hrm.employee.dto.DepartmentRequest;
import com.company.hrm.employee.dto.DepartmentResponse;
import com.company.hrm.employee.repository.DepartmentRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DepartmentService {

  private final DepartmentRepository departmentRepository;

  public DepartmentService(DepartmentRepository departmentRepository) {
    this.departmentRepository = departmentRepository;
  }

  @Transactional(readOnly = true)
  public List<DepartmentResponse> findAll() {
    return departmentRepository.findAll().stream().map(EmployeeMapper::toResponse).toList();
  }

  @Transactional(readOnly = true)
  public DepartmentResponse getById(Long id) {
    return EmployeeMapper.toResponse(findOrThrow(id));
  }

  public DepartmentResponse create(DepartmentRequest req) {
    Department d = new Department();
    apply(req, d);
    return EmployeeMapper.toResponse(departmentRepository.save(d));
  }

  public DepartmentResponse update(Long id, DepartmentRequest req) {
    Department d = findOrThrow(id);
    apply(req, d);
    return EmployeeMapper.toResponse(departmentRepository.save(d));
  }

  public void delete(Long id) {
    departmentRepository.delete(findOrThrow(id));
  }

  private void apply(DepartmentRequest req, Department d) {
    d.setName(req.name());
    d.setManagerId(req.managerId());
    if (req.parentId() != null) {
      d.setParent(findOrThrow(req.parentId()));
    } else {
      d.setParent(null);
    }
  }

  private Department findOrThrow(Long id) {
    return departmentRepository
        .findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Department", id));
  }
}
