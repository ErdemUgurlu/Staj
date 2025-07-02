package com.formapp.backend.repository;

import com.formapp.backend.model.Scenario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScenarioRepository extends JpaRepository<Scenario, Long> {
    
    Optional<Scenario> findByBroadcastIdAndIsActiveTrue(String broadcastId);
    
    List<Scenario> findByIsActiveTrue();
    
    @Query("SELECT s FROM Scenario s WHERE s.broadcastId = :broadcastId AND s.isActive = true")
    Optional<Scenario> findActiveBroadcastScenario(@Param("broadcastId") String broadcastId);
} 