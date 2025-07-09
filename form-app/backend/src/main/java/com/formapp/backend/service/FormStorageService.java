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
import org.springframework.scheduling.annotation.Scheduled;

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
        
        // Load FormSubmissions from XML and populate the in-memory storage
        loadFormSubmissionsFromXml();
    }
    
    private void loadFormSubmissionsFromXml() {
        List<FormSubmission> formSubmissions = xmlStorageService.loadFormSubmissions();
        for (FormSubmission submission : formSubmissions) {
            formStorage.put(submission.getId(), submission);
        }
    }
    
    private void saveFormSubmissionsToXml() {
        List<FormSubmission> formSubmissions = new ArrayList<>(formStorage.values());
        xmlStorageService.saveFormSubmissions(formSubmissions);
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
        saveFormSubmissionsToXml();
        
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
        saveFormSubmissionsToXml();
        
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
            saveFormSubmissionsToXml();
            
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
        Optional<Broadcast> broadcastOpt = getBroadcastById(scenario.getBroadcastId());
        if (broadcastOpt.isPresent()) {
            Broadcast broadcast = broadcastOpt.get();
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
            saveFormSubmissionsToXml();
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

    // Activity log filtreleme metodu
    public List<ActivityLog> getActivityLogsByAction(String action, Integer limit) {
        return activityLogs.stream()
                .filter(log -> action == null || action.isEmpty() || log.getAction().equalsIgnoreCase(action))
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp())) // En yeniden eskiye sırala
                .limit(limit != null && limit > 0 ? limit : activityLogs.size())
                .collect(Collectors.toList());
    }

    public List<ActivityLog> getActivityLogsByEntityType(String entityType, Integer limit) {
        return activityLogs.stream()
                .filter(log -> entityType == null || entityType.isEmpty() || log.getEntityType().equalsIgnoreCase(entityType))
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .limit(limit != null && limit > 0 ? limit : activityLogs.size())
                .collect(Collectors.toList());
    }

    public List<ActivityLog> getActivityLogsWithFilters(String action, String entityType, Integer limit) {
        return activityLogs.stream()
                .filter(log -> (action == null || action.isEmpty() || log.getAction().equalsIgnoreCase(action)) &&
                               (entityType == null || entityType.isEmpty() || log.getEntityType().equalsIgnoreCase(entityType)))
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .limit(limit != null && limit > 0 ? limit : activityLogs.size())
                .collect(Collectors.toList());
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
        String id = UUID.randomUUID().toString();
        Message message = new Message(messageName, messageType, parameters);
        message.setId(id);
        message.setSaved(saveMessage);
        message.setSent(sendMessage);

        // Handle special message types
        if (sendMessage) {
            // Dummy TCP message sending
            System.out.println("Sending TCP message: " + messageType);
            System.out.println("Parameters: " + parameters);
            
            // Update broadcast status based on message type
            if ("yayinEkle".equals(messageType)) {
                // Create new broadcast from yayinEkle message parameters
                try {
                    Map<String, Object> params = JsonMapConverter.parseJsonString(parameters);
                    String yayinId = String.valueOf(params.get("yayinId"));
                    
                    // Check if broadcast with this ID already exists
                    boolean exists = broadcasts.stream()
                        .anyMatch(b -> b.getId().equals(yayinId));
                    
                    if (!exists) {
                        Broadcast newBroadcast = new Broadcast();
                        newBroadcast.setId(yayinId);
                        newBroadcast.setName("Yayın " + yayinId);
                        
                        // Set parameters from message
                        newBroadcast.setAmplitude(new BigDecimal(String.valueOf(params.get("amplitude"))));
                        newBroadcast.setPri(new BigDecimal(String.valueOf(params.get("pri"))));
                        newBroadcast.setDirection(new BigDecimal(String.valueOf(params.get("direction"))));
                        newBroadcast.setPulseWidth(new BigDecimal(String.valueOf(params.get("pulseWidth"))));
                        
                        // Set initial status
                        newBroadcast.setActive(false);  // Initially inactive until yayinBaslat is sent
                        newBroadcast.setTcpSent(true);   // TCP message was sent
                        
                        broadcasts.add(newBroadcast);
                        xmlStorageService.saveBroadcasts(broadcasts);
                        
                        // Log the creation
                        Map<String, Object> broadcastData = new HashMap<>();
                        broadcastData.put("id", newBroadcast.getId());
                        broadcastData.put("name", newBroadcast.getName());
                        broadcastData.put("amplitude", newBroadcast.getAmplitude());
                        broadcastData.put("pri", newBroadcast.getPri());
                        broadcastData.put("direction", newBroadcast.getDirection());
                        broadcastData.put("pulseWidth", newBroadcast.getPulseWidth());
                        logActivity("CREATE", "BROADCAST", newBroadcast.getId(), "Yayın eklendi", broadcastData);
                    }
                } catch (Exception e) {
                    System.err.println("Error creating broadcast from yayinEkle message: " + e.getMessage());
                }
            } else if ("yayinBaslat".equals(messageType)) {
                updateBroadcastStatus(extractYayinId(parameters), true);
            } else if ("yayinDurdur".equals(messageType)) {
                updateBroadcastStatus(extractYayinId(parameters), false);
            } else if ("yayinSil".equals(messageType)) {
                // For yayinSil, we need to:
                // 1. Send TCP message (already done above)
                // 2. Delete the broadcast
                String yayinId = extractYayinId(parameters);
                Optional<Broadcast> broadcast = broadcasts.stream()
                    .filter(b -> b.getId().equals(yayinId))
                    .findFirst();
                
                if (broadcast.isPresent()) {
                    broadcasts.remove(broadcast.get());
                    xmlStorageService.saveBroadcasts(broadcasts);
                    
                    // Log the deletion
                    Map<String, Object> broadcastData = new HashMap<>();
                    broadcastData.put("id", broadcast.get().getId());
                    broadcastData.put("name", broadcast.get().getName());
                    logActivity("DELETE", "BROADCAST", broadcast.get().getId(), "Yayın silindi", broadcastData);
                }
            } else if ("yayinYonGuncelle".equals(messageType)) {
                updateBroadcastDirection(parameters);
            } else if ("yayinGenlikGuncelle".equals(messageType)) {
                updateBroadcastAmplitude(parameters);
            }
        }

        if (saveMessage) {
            messages.add(message);
            xmlStorageService.saveMessages(messages);
        }

        return message;
    }

    private String extractYayinId(String parameters) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            Map<String, Object> paramMap = mapper.readValue(parameters, Map.class);
            return (String) paramMap.get("yayinId");
        } catch (Exception e) {
            System.err.println("Error extracting yayinId from parameters: " + e.getMessage());
            return null;
        }
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

    @Scheduled(fixedDelay = 1000) // Run every second
    public void processActiveScenarios() {
        long currentTime = System.currentTimeMillis();
        
        for (Scenario scenario : scenarios) {
            if (scenario.getIsActive() && scenario.getStartTime() != null) {
                double elapsedTime = (currentTime - scenario.getStartTime()) / 1000.0; // Convert to seconds
                
                // Check if scenario has completed
                if (elapsedTime >= scenario.getDuration()) {
                    // Set final values exactly as specified before marking as complete
                    updateBroadcastFromScenario(scenario.getBroadcastId(), 
                        scenario.getFinalAmplitude(), scenario.getFinalDirection());
                    sendScenarioUpdateMessages(scenario.getBroadcastId(), 
                        scenario.getFinalAmplitude(), scenario.getFinalDirection());
                    
                    scenario.setIsActive(false);
                    xmlStorageService.saveScenarios(scenarios);
                    
                    // Log scenario completion
                    Map<String, Object> scenarioData = new HashMap<>();
                    scenarioData.put("broadcastId", scenario.getBroadcastId());
                    scenarioData.put("duration", scenario.getDuration());
                    scenarioData.put("finalAmplitude", scenario.getFinalAmplitude());
                    scenarioData.put("finalDirection", scenario.getFinalDirection());
                    logActivity("COMPLETE", "SCENARIO", scenario.getId(), "Senaryo tamamlandı - final değerler uygulandı", scenarioData);
                    
                    continue;
                }
                
                // Check if it's time for an update
                double updateInterval = scenario.getUpdateFrequency();
                if (updateInterval > 0 && elapsedTime % updateInterval < 1.0) { // Within 1 second tolerance
                    // Calculate current values based on elapsed time
                    double progress = elapsedTime / scenario.getDuration();
                    if (progress > 1.0) progress = 1.0;
                    
                    // Linear interpolation
                    double currentAmplitude = scenario.getInitialAmplitude() + 
                        (scenario.getFinalAmplitude() - scenario.getInitialAmplitude()) * progress;
                    double currentDirection = scenario.getInitialDirection() + 
                        (scenario.getFinalDirection() - scenario.getInitialDirection()) * progress;
                    
                    // Update broadcast parameters
                    updateBroadcastFromScenario(scenario.getBroadcastId(), currentAmplitude, currentDirection);
                    
                    // Send update messages
                    sendScenarioUpdateMessages(scenario.getBroadcastId(), currentAmplitude, currentDirection);
                }
            }
        }
    }
    
    private void updateBroadcastFromScenario(String broadcastId, double amplitude, double direction) {
        broadcasts.stream()
            .filter(b -> b.getId().equals(broadcastId))
            .findFirst()
            .ifPresent(broadcast -> {
                broadcast.setAmplitude(BigDecimal.valueOf(amplitude));
                broadcast.setDirection(BigDecimal.valueOf(direction));
                xmlStorageService.saveBroadcasts(broadcasts);
            });
    }
    
    private void sendScenarioUpdateMessages(String broadcastId, double amplitude, double direction) {
        try {
            // Send amplitude update message
            Map<String, Object> amplitudeParams = new HashMap<>();
            amplitudeParams.put("yayinId", broadcastId);
            amplitudeParams.put("newAmplitude", amplitude);
            String amplitudeParamsJson = convertMapToJson(amplitudeParams);
            
            Message amplitudeMsg = new Message("Senaryo Genlik Güncelleme", "yayinGenlikGuncelle", amplitudeParamsJson);
            amplitudeMsg.setId(UUID.randomUUID().toString());
            amplitudeMsg.setSaved(false);
            amplitudeMsg.setSent(true);
            
            // Send direction update message
            Map<String, Object> directionParams = new HashMap<>();
            directionParams.put("yayinId", broadcastId);
            directionParams.put("newDirection", direction);
            String directionParamsJson = convertMapToJson(directionParams);
            
            Message directionMsg = new Message("Senaryo Yön Güncelleme", "yayinYonGuncelle", directionParamsJson);
            directionMsg.setId(UUID.randomUUID().toString());
            directionMsg.setSaved(false);
            directionMsg.setSent(true);
            
            // Add to messages list but don't save to XML (they are auto-generated)
            // Just process the TCP sending
            System.out.println("Sending TCP message: yayinGenlikGuncelle");
            System.out.println("Parameters: " + amplitudeParamsJson);
            
            System.out.println("Sending TCP message: yayinYonGuncelle");
            System.out.println("Parameters: " + directionParamsJson);
            
            // Log the update
            Map<String, Object> updateData = new HashMap<>();
            updateData.put("broadcastId", broadcastId);
            updateData.put("amplitude", amplitude);
            updateData.put("direction", direction);
            logActivity("UPDATE", "SCENARIO", broadcastId, "Senaryo otomatik güncelleme", updateData);
            
        } catch (Exception e) {
            System.err.println("Error sending scenario update messages: " + e.getMessage());
        }
    }
} 