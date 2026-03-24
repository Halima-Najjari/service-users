package com.example.Talentscope.dto;

import com.example.Talentscope.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateUserRequest {
    
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "L'email doit être valide")
    private String email;
    
    @NotBlank(message = "Le mot de passe est obligatoire")
    private String password;
    
    @NotNull(message = "Le rôle est obligatoire")
    private Role role;
    
    private UUID encadrantId;
}
