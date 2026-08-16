package com.company.hrm.leave.domain;

import com.company.hrm.common.BaseEntity;
import com.company.hrm.employee.domain.Employee;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "leave_balance", uniqueConstraints =
        @UniqueConstraint(name = "uq_leave_balance", columnNames = {"employee_id", "leave_type_id", "year"}))
public class LeaveBalance extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne
    @JoinColumn(name = "leave_type_id", nullable = false)
    private LeaveType leaveType;

    @Column(nullable = false)
    private int year;

    @Column(nullable = false)
    private int entitled = 0;

    @Column(nullable = false)
    private int used = 0;

    @Column(nullable = false)
    private int remaining = 0;
}
