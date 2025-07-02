package com.formapp.backend.repository;

import com.formapp.backend.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, String> {
    List<ActivityLog> findByEntityId(String entityId);
    List<ActivityLog> findByEntityType(String entityType);
    List<ActivityLog> findByAction(String action);
    List<ActivityLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    List<ActivityLog> findByEntityTypeAndEntityId(String entityType, String entityId);
} 