package com.company.hrm.leave;

import com.company.hrm.common.ResourceNotFoundException;
import com.company.hrm.leave.domain.LeaveType;
import com.company.hrm.leave.dto.LeaveTypeRequest;
import com.company.hrm.leave.dto.LeaveTypeResponse;
import com.company.hrm.leave.repository.LeaveTypeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class LeaveTypeService {

    private final LeaveTypeRepository leaveTypeRepository;

    public LeaveTypeService(LeaveTypeRepository leaveTypeRepository) {
        this.leaveTypeRepository = leaveTypeRepository;
    }

    @Transactional(readOnly = true)
    public List<LeaveTypeResponse> findAll() {
        return leaveTypeRepository.findAll().stream().map(LeaveMapper::toResponse).toList();
    }

    public LeaveTypeResponse create(LeaveTypeRequest req) {
        LeaveType t = new LeaveType();
        apply(req, t);
        return LeaveMapper.toResponse(leaveTypeRepository.save(t));
    }

    public LeaveTypeResponse update(Long id, LeaveTypeRequest req) {
        LeaveType t = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveType", id));
        apply(req, t);
        return LeaveMapper.toResponse(leaveTypeRepository.save(t));
    }

    public void delete(Long id) {
        LeaveType t = leaveTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("LeaveType", id));
        leaveTypeRepository.delete(t);
    }

    private void apply(LeaveTypeRequest req, LeaveType t) {
        t.setName(req.name());
        t.setPaid(req.paid());
        t.setMaxDaysPerYear(req.maxDaysPerYear());
    }
}
