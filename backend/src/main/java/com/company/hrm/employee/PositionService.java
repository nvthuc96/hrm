package com.company.hrm.employee;

import com.company.hrm.common.ResourceNotFoundException;
import com.company.hrm.employee.domain.Position;
import com.company.hrm.employee.dto.PositionRequest;
import com.company.hrm.employee.dto.PositionResponse;
import com.company.hrm.employee.repository.PositionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class PositionService {

    private final PositionRepository positionRepository;

    public PositionService(PositionRepository positionRepository) {
        this.positionRepository = positionRepository;
    }

    @Transactional(readOnly = true)
    public List<PositionResponse> findAll() {
        return positionRepository.findAll().stream()
                .map(EmployeeMapper::toResponse)
                .toList();
    }

    public PositionResponse create(PositionRequest req) {
        Position p = new Position();
        p.setName(req.name());
        p.setLevel(req.level());
        return EmployeeMapper.toResponse(positionRepository.save(p));
    }

    public PositionResponse update(Long id, PositionRequest req) {
        Position p = positionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Position", id));
        p.setName(req.name());
        p.setLevel(req.level());
        return EmployeeMapper.toResponse(positionRepository.save(p));
    }

    public void delete(Long id) {
        Position p = positionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Position", id));
        positionRepository.delete(p);
    }
}
