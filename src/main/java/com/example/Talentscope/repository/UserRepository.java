package com.example.Talentscope.repository;

import com.example.Talentscope.entity.User;
import com.example.Talentscope.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    
    Optional<User> findByEmail(String email);
    
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.encadrant WHERE u.id = :id")
    Optional<User> findByIdWithEncadrant(@Param("id") UUID id);
    
    boolean existsByEmail(String email);
    
    List<User> findByRole(Role role);
    
    List<User> findByEncadrant(User encadrant);
    
    List<User> findByRoleAndEncadrantIsNull(Role role);
}
