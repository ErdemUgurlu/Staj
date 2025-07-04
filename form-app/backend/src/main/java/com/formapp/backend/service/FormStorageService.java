package com.formapp.backend.service;

import com.formapp.backend.model.FormSubmission;
import com.formapp.backend.model.Scenario;
import com.formapp.backend.model.ActivityLog;
import com.formapp.backend.model.Broadcast;
import com.formapp.backend.model.Message;
import com.formapp.backend.repository.ActivityLogRepository;
import com.formapp.backend.repository.BroadcastRepository;
import com.formapp.backend.repository.ScenarioRepository;
import com.formapp.backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Optional;

@Service
public class FormStorageService {
    
    private final ConcurrentHashMap<String, FormSubmission> formStorage = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, ActivityLog> activityLogStorage = new ConcurrentHashMap<>();

    @Autowired
    private BroadcastRepository broadcastRepository;
    
    @Autowired
    private ActivityLogRepository activityLogRepository;
    
    @Autowired
    private ScenarioRepository scenarioRepository;
    
    @Autowired
    private MessageRepository messageRepository;
    
    private final ObjectMapper objectMapper = new ObjectMapper();

    public FormSubmission saveForm(String formType, Object formData) {
        String id = UUID.randomUUID().toString();
        LocalDateTime now = LocalDateTime.now();
        
        FormSubmission submission = new FormSubmission(
            id, 
            formType, 
            formData, 
            now, 
            "submitted"
        );
        
        formStorage.put(id, submission);
        
        // Log the activity
        logActivity("CREATE", "BROADCAST", id, "Yeni yayın oluşturuldu", convertToMap(formData));
        
        System.out.println("Form saved with ID: " + id);
        return submission;
    }

    public FormSubmission updateForm(String id, String formType, Object formData) {
        FormSubmission existingSubmission = formStorage.get(id);
        if (existingSubmission == null) {
            return null;
        }
        
        FormSubmission updatedSubmission = new FormSubmission(
            id,
            formType,
            formData,
            existingSubmission.getSubmittedAt(),
            existingSubmission.getStatus()
        );
        
        formStorage.put(id, updatedSubmission);
        
        // Log the activity
        logActivity("UPDATE", "BROADCAST", id, "Yayın parametreleri güncellendi", convertToMap(formData));
        
        System.out.println("Form updated with ID: " + id);
        return updatedSubmission;
    }

    public void toggleBroadcastActive(String id) {
        FormSubmission submission = formStorage.get(id);
        if (submission != null) {
            Map<String, Object> formData = (Map<String, Object>) submission.getFormData();
            boolean currentActive = (Boolean) formData.get("active");
            formData.put("active", !currentActive);
            
            FormSubmission updatedSubmission = new FormSubmission(
                id,
                submission.getFormType(),
                formData,
                submission.getSubmittedAt(),
                submission.getStatus()
            );
            
            formStorage.put(id, updatedSubmission);
            
            // Log the activity
            String action = !currentActive ? "ACTIVATE" : "DEACTIVATE";
            String description = !currentActive ? "Yayın aktif edildi" : "Yayın deaktif edildi";
            logActivity(action, "BROADCAST", id, description, convertToMap(formData));
        }
    }

    // Scenario methods
    public Scenario saveScenario(Scenario scenario) {
        // Get current broadcast values to set as initial values
        FormSubmission broadcastForm = getFormById(scenario.getBroadcastId());
        if (broadcastForm != null) {
            Broadcast broadcast = (Broadcast) broadcastForm.getFormData();
            scenario.setInitialAmplitude(broadcast.getAmplitude().doubleValue());
            scenario.setInitialDirection(broadcast.getDirection().doubleValue());
        }
        
        scenario.setStartTime(System.currentTimeMillis());
        scenario.setIsActive(true);
        
        // Log the activity
        Map<String, Object> scenarioData = new HashMap<>();
        scenarioData.put("broadcastId", scenario.getBroadcastId());
        scenarioData.put("initialAmplitude", scenario.getInitialAmplitude());
        scenarioData.put("initialDirection", scenario.getInitialDirection());
        scenarioData.put("finalAmplitude", scenario.getFinalAmplitude());
        scenarioData.put("finalDirection", scenario.getFinalDirection());
        scenarioData.put("duration", scenario.getDuration());
        scenarioData.put("updateFrequency", scenario.getUpdateFrequency());
        
        logActivity("CREATE", "SCENARIO", scenario.getId().toString(), "Yeni senaryo oluşturuldu", scenarioData);
        
        return scenarioRepository.save(scenario);
    }

    public Scenario getScenarioById(Long id) {
        return scenarioRepository.findById(id).orElse(null);
    }

    public Scenario getScenarioByBroadcastId(String broadcastId) {
        return scenarioRepository.findByBroadcastIdAndIsActiveTrue(broadcastId).orElse(null);
    }

    public List<Scenario> getAllScenarios() {
        return scenarioRepository.findAll();
    }

    public void deleteScenario(Long id) {
        Optional<Scenario> scenarioOpt = scenarioRepository.findById(id);
        if (scenarioOpt.isPresent()) {
            Scenario scenario = scenarioOpt.get();
            Map<String, Object> scenarioData = new HashMap<>();
            scenarioData.put("broadcastId", scenario.getBroadcastId());
            scenarioData.put("finalAmplitude", scenario.getFinalAmplitude());
            scenarioData.put("finalDirection", scenario.getFinalDirection());
            scenarioData.put("duration", scenario.getDuration());
            
            logActivity("DELETE", "SCENARIO", id.toString(), "Senaryo silindi", scenarioData);
            
            scenarioRepository.deleteById(id);
        }
    }

    public Scenario updateScenario(Long id, Scenario scenario) {
        if (scenarioRepository.existsById(id)) {
            scenario.setId(id);
            
            // Log the activity
            Map<String, Object> scenarioData = new HashMap<>();
            scenarioData.put("broadcastId", scenario.getBroadcastId());
            scenarioData.put("finalAmplitude", scenario.getFinalAmplitude());
            scenarioData.put("finalDirection", scenario.getFinalDirection());
            scenarioData.put("duration", scenario.getDuration());
            scenarioData.put("updateFrequency", scenario.getUpdateFrequency());
            
            logActivity("UPDATE", "SCENARIO", id.toString(), "Senaryo güncellendi", scenarioData);
            
            return scenarioRepository.save(scenario);
        }
        return null;
    }

    public List<FormSubmission> getAllForms() {
        List<FormSubmission> forms = new ArrayList<>(formStorage.values());
        // Sort by submission time (newest first)
        forms.sort((a, b) -> b.getSubmittedAt().compareTo(a.getSubmittedAt()));
        return forms;
    }

    public FormSubmission getFormById(String id) {
        return formStorage.get(id);
    }

    public void deleteForm(String id) {
        FormSubmission submission = formStorage.get(id);
        if (submission != null) {
            // Log the activity before deletion
            logActivity("DELETE", "BROADCAST", id, "Yayın silindi", convertToMap(submission.getFormData()));
            formStorage.remove(id);
        }
    }

    public int getFormCount() {
        return formStorage.size();
    }

    public List<FormSubmission> getFormsByType(String formType) {
        return formStorage.values().stream()
                .filter(form -> form.getFormType().equals(formType))
                .sorted((a, b) -> b.getSubmittedAt().compareTo(a.getSubmittedAt()))
                .toList();
    }

    // Activity Log methods
    private void logActivity(String action, String entityType, String entityId, String description, Map<String, Object> entityData) {
        String logId = UUID.randomUUID().toString();
        ActivityLog log = new ActivityLog(action, entityType, entityId, description, entityData);
        log.setId(logId);
        activityLogStorage.put(logId, log);
    }

    public List<ActivityLog> getAllActivityLogs() {
        List<ActivityLog> logs = new ArrayList<>(activityLogStorage.values());
        // Sort by timestamp (newest first)
        logs.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
        return logs;
    }

    public ActivityLog getActivityLogById(String id) {
        return activityLogStorage.get(id);
    }

    private Map<String, Object> convertToMap(Object obj) {
        if (obj instanceof Map) {
            return (Map<String, Object>) obj;
        }
        
        Map<String, Object> map = new HashMap<>();
        
        // Handle Broadcast objects specifically
        if (obj instanceof Broadcast) {
            Broadcast broadcast = (Broadcast) obj;
            map.put("id", broadcast.getId());
            map.put("name", broadcast.getName());
            map.put("amplitude", broadcast.getAmplitude());
            map.put("pri", broadcast.getPri());
            map.put("direction", broadcast.getDirection());
            map.put("pulseWidth", broadcast.getPulseWidth());
            map.put("active", broadcast.isActive());
            map.put("tcpSent", broadcast.isTcpSent());
            return map;
        }
        
        // Fallback for other objects
        map.put("data", obj.toString());
        return map;
    }

    public List<FormSubmission> getFormSubmissions() {
        return new ArrayList<>(); // Not implemented yet
    }

    public List<Broadcast> getBroadcasts() {
        return broadcastRepository.findAll();
    }

    public List<ActivityLog> getActivityLogs() {
        return activityLogRepository.findAll();
    }

    public Broadcast saveBroadcast(Broadcast broadcast) {
        if (broadcast.getId() == null) {
            broadcast.setId(UUID.randomUUID().toString());
        }
        return broadcastRepository.save(broadcast);
    }

    public void deleteBroadcast(String id) {
        broadcastRepository.deleteById(id);
    }

    public Optional<Broadcast> getBroadcastById(String id) {
        return broadcastRepository.findById(id);
    }

    public List<Broadcast> getBroadcastsByType(String type) {
        if ("Broadcast".equals(type)) {
            return broadcastRepository.findAll();
        }
        return new ArrayList<>();
    }

    public void saveActivityLog(ActivityLog log) {
        if (log.getId() == null) {
            log.setId(UUID.randomUUID().toString());
        }
        activityLogRepository.save(log);
    }

    public void updateBroadcastStatus(String id, boolean active) {
        broadcastRepository.findById(id).ifPresent(broadcast -> {
            broadcast.setActive(active);
            broadcastRepository.save(broadcast);
        });
    }

    public void updateBroadcastTcpStatus(String id, boolean tcpSent) {
        broadcastRepository.findById(id).ifPresent(broadcast -> {
            broadcast.setTcpSent(tcpSent);
            broadcastRepository.save(broadcast);
        });
    }

    public List<Broadcast> getActiveBroadcasts() {
        return broadcastRepository.findByActive(true);
    }

    public List<Broadcast> getTcpSentBroadcasts() {
        return broadcastRepository.findByTcpSent(true);
    }

    // Message methods
    public Message saveMessage(String messageName, String messageType, String parameters) {
        Message message = new Message(messageName, messageType, parameters);
        return messageRepository.save(message);
    }
    
    public Message updateMessage(Message message) {
        return messageRepository.save(message);
    }
    
    public List<Message> getAllMessages() {
        return messageRepository.findAll();
    }
    
    public List<Message> getMessagesByType(String messageType) {
        return messageRepository.findByMessageType(messageType);
    }
    
    public void deleteMessage(String id) {
        messageRepository.deleteById(id);
    }
    
    public String convertMapToJson(Map<String, Object> map) {
        try {
            return objectMapper.writeValueAsString(map);
        } catch (Exception e) {
            e.printStackTrace();
            return "{}";
        }
    }
} 