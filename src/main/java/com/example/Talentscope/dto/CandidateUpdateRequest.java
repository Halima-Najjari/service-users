package com.example.Talentscope.dto;

import com.example.Talentscope.entity.CandidateStatus;
import lombok.Data;

@Data
public class CandidateUpdateRequest {
    
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private CandidateStatus status;
}
