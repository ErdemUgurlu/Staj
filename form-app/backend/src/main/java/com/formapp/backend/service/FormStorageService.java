package com.formapp.backend.service;

import com.formapp.backend.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;
import java.math.BigDecimal;

@Service
public class FormStorageService {
    
    private final ConcurrentHashMap<String, FormSubmission> formStorage = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<String, ActivityLog> activityLogStorage = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private XmlStorageService xmlStorageService;

    private List<Broadcast> broadcasts;
    private List<Message> messages;
    private List<Scenario> scenarios;
    private List<ActivityLog> activityLogs;

    public FormStorageService(XmlStorageService xmlStorageService) {
        this.xmlStorageService = xmlStorageService;
        this.broadcasts = xmlStorageService.loadBroadcasts();
        this.messages = xmlStorageService.loadMessages();
        this.scenarios = xmlStorageService.loadScenarios();
        this.activityLogs = xmlStorageService.loadActivityLogs();
    }

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
        if (scenario.getId() == null) {
            scenario.setId(UUID.randomUUID().toString());
        }
        
        // Get current broadcast values to set as initial values
        FormSubmission broadcastForm = getFormById(scenario.getBroadcastId());
        if (broadcastForm != null) {
            Broadcast broadcast = (Broadcast) broadcastForm.getFormData();
            scenario.setInitialAmplitude(broadcast.getAmplitude().doubleValue());
            scenario.setInitialDirection(broadcast.getDirection().doubleValue());
        }
        
        scenario.setStartTime(System.currentTimeMillis());
        scenario.setIsActive(true);
        
        scenarios.add(scenario);
        xmlStorageService.saveScenarios(scenarios);
        
        // Log the activity
        Map<String, Object> scenarioData = new HashMap<>();
        scenarioData.put("broadcastId", scenario.getBroadcastId());
        scenarioData.put("initialAmplitude", scenario.getInitialAmplitude());
        scenarioData.put("initialDirection", scenario.getInitialDirection());
        scenarioData.put("finalAmplitude", scenario.getFinalAmplitude());
        scenarioData.put("finalDirection", scenario.getFinalDirection());
        scenarioData.put("duration", scenario.getDuration());
        scenarioData.put("updateFrequency", scenario.getUpdateFrequency());
        
        logActivity("CREATE", "SCENARIO", scenario.getId(), "Yeni senaryo oluşturuldu", scenarioData);
        
        return scenario;
    }

    public Scenario getScenarioById(String id) {
        return scenarios.stream()
                .filter(s -> s.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    public Scenario getScenarioByBroadcastId(String broadcastId) {
        return scenarios.stream()
                .filter(s -> s.getBroadcastId().equals(broadcastId) && s.getIsActive())
                .findFirst()
                .orElse(null);
    }

    public List<Scenario> getAllScenarios() {
        return new ArrayList<>(scenarios);
    }

    public void deleteScenario(String id) {
        Optional<Scenario> scenarioOpt = scenarios.stream()
                .filter(s -> s.getId().equals(id))
                .findFirst();
                
        if (scenarioOpt.isPresent()) {
            Scenario scenario = scenarioOpt.get();
            scenarios.remove(scenario);
            xmlStorageService.saveScenarios(scenarios);
            
            Map<String, Object> scenarioData = new HashMap<>();
            scenarioData.put("broadcastId", scenario.getBroadcastId());
            scenarioData.put("finalAmplitude", scenario.getFinalAmplitude());
            scenarioData.put("finalDirection", scenario.getFinalDirection());
            scenarioData.put("duration", scenario.getDuration());
            
            logActivity("DELETE", "SCENARIO", id, "Senaryo silindi", scenarioData);
        }
    }

    public Scenario updateScenario(String id, Scenario scenario) {
        Optional<Scenario> existingScenario = scenarios.stream()
                .filter(s -> s.getId().equals(id))
                .findFirst();
                
        if (existingScenario.isPresent()) {
            scenarios.remove(existingScenario.get());
            scenarios.add(scenario);
            xmlStorageService.saveScenarios(scenarios);
            
            Map<String, Object> scenarioData = new HashMap<>();
            scenarioData.put("broadcastId", scenario.getBroadcastId());
            scenarioData.put("finalAmplitude", scenario.getFinalAmplitude());
            scenarioData.put("finalDirection", scenario.getFinalDirection());
            scenarioData.put("duration", scenario.getDuration());
            scenarioData.put("updateFrequency", scenario.getUpdateFrequency());
            
            logActivity("UPDATE", "SCENARIO", id, "Senaryo güncellendi", scenarioData);
            
            return scenario;
        }
        return null;
    }

    public List<FormSubmission> getAllForms() {
        List<FormSubmission> forms = new ArrayList<>(formStorage.values());
        forms.sort((a, b) -> b.getSubmittedAt().compareTo(a.getSubmittedAt()));
        return forms;
    }

    public FormSubmission getFormById(String id) {
        return formStorage.get(id);
    }

    public void deleteForm(String id) {
        FormSubmission submission = formStorage.get(id);
        if (submission != null) {
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
                .collect(Collectors.toList());
    }

    // Activity Log methods
    private void logActivity(String action, String entityType, String entityId, String description, Map<String, Object> entityData) {
        String logId = UUID.randomUUID().toString();
        ActivityLog log = new ActivityLog(action, entityType, entityId, description, entityData);
        log.setId(logId);
        activityLogs.add(log);
        xmlStorageService.saveActivityLogs(activityLogs);
    }

    public List<ActivityLog> getAllActivityLogs() {
        return new ArrayList<>(activityLogs);
    }

    public ActivityLog getActivityLogById(String id) {
        return activityLogs.stream()
                .filter(log -> log.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    private Map<String, Object> convertToMap(Object obj) {
        if (obj instanceof Map) {
            return (Map<String, Object>) obj;
        }
        
        Map<String, Object> map = new HashMap<>();
        
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
        
        map.put("data", obj.toString());
        return map;
    }

    public List<Broadcast> getBroadcasts() {
        return new ArrayList<>(broadcasts);
    }

    public List<ActivityLog> getActivityLogs() {
        return new ArrayList<>(activityLogs);
    }

    public Broadcast saveBroadcast(Broadcast broadcast) {
        if (broadcast.getId() == null) {
            broadcast.setId(UUID.randomUUID().toString());
        }
        broadcasts.add(broadcast);
        xmlStorageService.saveBroadcasts(broadcasts);
        return broadcast;
    }

    public void deleteBroadcast(String id) {
        broadcasts.removeIf(b -> b.getId().equals(id));
        xmlStorageService.saveBroadcasts(broadcasts);
    }

    public Optional<Broadcast> getBroadcastById(String id) {
        return broadcasts.stream()
                .filter(b -> b.getId().equals(id))
                .findFirst();
    }

    public List<Broadcast> getBroadcastsByType(String type) {
        if ("Broadcast".equals(type)) {
            return new ArrayList<>(broadcasts);
        }
        return new ArrayList<>();
    }

    public void saveActivityLog(ActivityLog log) {
        if (log.getId() == null) {
            log.setId(UUID.randomUUID().toString());
        }
        activityLogs.add(log);
        xmlStorageService.saveActivityLogs(activityLogs);
    }

    public void updateBroadcastStatus(String id, boolean active) {
        broadcasts.stream()
                .filter(b -> b.getId().equals(id))
                .findFirst()
                .ifPresent(broadcast -> {
                    broadcast.setActive(active);
                    xmlStorageService.saveBroadcasts(broadcasts);
                });
    }

    public void updateBroadcastTcpStatus(String id, boolean tcpSent) {
        broadcasts.stream()
                .filter(b -> b.getId().equals(id))
                .findFirst()
                .ifPresent(broadcast -> {
                    broadcast.setTcpSent(tcpSent);
                    xmlStorageService.saveBroadcasts(broadcasts);
                });
    }

    public List<Broadcast> getActiveBroadcasts() {
        return broadcasts.stream()
                .filter(Broadcast::isActive)
                .collect(Collectors.toList());
    }

    public List<Broadcast> getTcpSentBroadcasts() {
        return broadcasts.stream()
                .filter(Broadcast::isTcpSent)
                .collect(Collectors.toList());
    }

    // Message methods
    public Message saveMessage(String messageName, String messageType, String parameters, boolean saveMessage, boolean sendMessage) {
        Message message = new Message(messageName, messageType, parameters);
        if (message.getId() == null) {
            message.setId(UUID.randomUUID().toString());
        }
        
        // Set the saved and sent flags based on parameters
        message.setSaved(saveMessage);
        message.setSent(sendMessage);
        
        // Handle broadcast updates for specific message types
        if (sendMessage && "yayinYonGuncelle".equals(messageType)) {
            updateBroadcastDirection(parameters);
        } else if (sendMessage && "yayinGenlikGuncelle".equals(messageType)) {
            updateBroadcastAmplitude(parameters);
        }
        
        // Always add to storage
        messages.add(message);
        xmlStorageService.saveMessages(messages);
        
        // Log the activity
        Map<String, Object> messageData = new HashMap<>();
        messageData.put("id", message.getId());
        messageData.put("messageName", message.getMessageName());
        messageData.put("messageType", message.getMessageType());
        messageData.put("parameters", message.getParameters());
        messageData.put("saved", message.isSaved());
        messageData.put("sent", message.isSent());
        
        ActivityLog log = new ActivityLog();
        log.setId(UUID.randomUUID().toString());
        log.setAction("CREATE");
        log.setEntityType("MESSAGE");
        log.setEntityId(message.getId());
        log.setDescription((messageType != null ? messageType : "null") + " mesajı oluşturuldu");
        log.setEntityData(messageData);
        log.setTimestamp(LocalDateTime.now());
        
        activityLogs.add(log);
        xmlStorageService.saveActivityLogs(activityLogs);
        
        return message;
    }

    private void updateBroadcastDirection(String parameters) {
        try {
            Map<String, Object> params = JsonMapConverter.parseJsonString(parameters);
            String yayinId = String.valueOf(params.get("yayinId"));
            Object newDirectionObj = params.get("newDirection");
            
            if (yayinId != null && newDirectionObj != null) {
                BigDecimal newDirection = new BigDecimal(String.valueOf(newDirectionObj));
                
                // Find and update the broadcast
                for (Broadcast broadcast : broadcasts) {
                    if (yayinId.equals(broadcast.getId())) {
                        broadcast.setDirection(newDirection);
                        xmlStorageService.saveBroadcasts(broadcasts);
                        
                        // Create entity data map
                        Map<String, Object> entityData = new HashMap<>();
                        entityData.put("id", broadcast.getId());
                        entityData.put("name", broadcast.getName());
                        entityData.put("direction", broadcast.getDirection());
                        entityData.put("amplitude", broadcast.getAmplitude());
                        
                        // Log the update
                        ActivityLog log = new ActivityLog();
                        log.setId(UUID.randomUUID().toString());
                        log.setAction("UPDATE");
                        log.setEntityType("BROADCAST");
                        log.setEntityId(broadcast.getId());
                        log.setDescription("Yayın yönü güncellendi: " + newDirection + "°");
                        log.setEntityData(entityData);
                        log.setTimestamp(LocalDateTime.now());
                        
                        activityLogs.add(log);
                        xmlStorageService.saveActivityLogs(activityLogs);
                        break;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error updating broadcast direction: " + e.getMessage());
        }
    }

    private void updateBroadcastAmplitude(String parameters) {
        try {
            Map<String, Object> params = JsonMapConverter.parseJsonString(parameters);
            String yayinId = String.valueOf(params.get("yayinId"));
            Object newAmplitudeObj = params.get("newAmplitude");
            
            if (yayinId != null && newAmplitudeObj != null) {
                BigDecimal newAmplitude = new BigDecimal(String.valueOf(newAmplitudeObj));
                
                // Find and update the broadcast
                for (Broadcast broadcast : broadcasts) {
                    if (yayinId.equals(broadcast.getId())) {
                        broadcast.setAmplitude(newAmplitude);
                        xmlStorageService.saveBroadcasts(broadcasts);
                        
                        // Create entity data map
                        Map<String, Object> entityData = new HashMap<>();
                        entityData.put("id", broadcast.getId());
                        entityData.put("name", broadcast.getName());
                        entityData.put("direction", broadcast.getDirection());
                        entityData.put("amplitude", broadcast.getAmplitude());
                        
                        // Log the update
                        ActivityLog log = new ActivityLog();
                        log.setId(UUID.randomUUID().toString());
                        log.setAction("UPDATE");
                        log.setEntityType("BROADCAST");
                        log.setEntityId(broadcast.getId());
                        log.setDescription("Yayın genliği güncellendi: " + newAmplitude);
                        log.setEntityData(entityData);
                        log.setTimestamp(LocalDateTime.now());
                        
                        activityLogs.add(log);
                        xmlStorageService.saveActivityLogs(activityLogs);
                        break;
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error updating broadcast amplitude: " + e.getMessage());
        }
    }
    
    public Message updateMessage(Message updatedMessage) {
        for (int i = 0; i < messages.size(); i++) {
            if (messages.get(i).getId().equals(updatedMessage.getId())) {
                messages.set(i, updatedMessage);
                xmlStorageService.saveMessages(messages);
                return updatedMessage;
            }
        }
        return null;
    }

    public Message getMessageById(String id) {
        return messages.stream()
                .filter(msg -> msg.getId().equals(id))
                .findFirst()
                .orElse(null);
    }

    public boolean deleteMessage(String id) {
        boolean removed = messages.removeIf(msg -> msg.getId().equals(id));
        if (removed) {
            xmlStorageService.saveMessages(messages);
        }
        return removed;
    }
    
    public List<Message> getAllMessages() {
        return new ArrayList<>(messages);
    }
    
    public List<Message> getMessagesByType(String messageType) {
        return messages.stream()
                .filter(m -> m.getMessageType().equals(messageType))
                .collect(Collectors.toList());
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