package com.formapp.backend.repository;

import com.formapp.backend.model.Broadcast;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BroadcastRepository extends JpaRepository<Broadcast, String> {
    List<Broadcast> findByActive(boolean active);
    List<Broadcast> findByTcpSent(boolean tcpSent);
    List<Broadcast> findByScenarioId(String scenarioId);
} 