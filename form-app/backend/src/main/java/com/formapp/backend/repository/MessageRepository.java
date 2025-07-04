package com.formapp.backend.repository;

import com.formapp.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, String> {
    List<Message> findByMessageType(String messageType);
    List<Message> findBySent(boolean sent);
    List<Message> findByMessageTypeAndSent(String messageType, boolean sent);
} 