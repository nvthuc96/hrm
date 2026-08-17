package com.company.hrm.employee;

import com.company.hrm.employee.dto.DepartmentRequest;
import com.company.hrm.employee.dto.DepartmentResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

  private final DepartmentService departmentService;

  public DepartmentController(DepartmentService departmentService) {
    this.departmentService = departmentService;
  }

  @GetMapping
  public List<DepartmentResponse> findAll() {
    return departmentService.findAll();
  }

  @GetMapping("/{id}")
  public DepartmentResponse getById(@PathVariable Long id) {
    return departmentService.getById(id);
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasAnyRole('ADMIN','HR')")
  public DepartmentResponse create(@Valid @RequestBody DepartmentRequest request) {
    return departmentService.create(request);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','HR')")
  public DepartmentResponse update(
      @PathVariable Long id, @Valid @RequestBody DepartmentRequest request) {
    return departmentService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @PreAuthorize("hasRole('ADMIN')")
  public void delete(@PathVariable Long id) {
    departmentService.delete(id);
  }
}
