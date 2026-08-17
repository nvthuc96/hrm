package com.company.hrm.leave;

import com.company.hrm.leave.dto.LeaveTypeRequest;
import com.company.hrm.leave.dto.LeaveTypeResponse;
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
@RequestMapping("/api/leave-types")
public class LeaveTypeController {

  private final LeaveTypeService leaveTypeService;

  public LeaveTypeController(LeaveTypeService leaveTypeService) {
    this.leaveTypeService = leaveTypeService;
  }

  @GetMapping
  public List<LeaveTypeResponse> findAll() {
    return leaveTypeService.findAll();
  }

  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  @PreAuthorize("hasAnyRole('ADMIN','HR')")
  public LeaveTypeResponse create(@Valid @RequestBody LeaveTypeRequest request) {
    return leaveTypeService.create(request);
  }

  @PutMapping("/{id}")
  @PreAuthorize("hasAnyRole('ADMIN','HR')")
  public LeaveTypeResponse update(
      @PathVariable Long id, @Valid @RequestBody LeaveTypeRequest request) {
    return leaveTypeService.update(id, request);
  }

  @DeleteMapping("/{id}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  @PreAuthorize("hasRole('ADMIN')")
  public void delete(@PathVariable Long id) {
    leaveTypeService.delete(id);
  }
}
