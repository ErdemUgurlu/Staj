package com.formapp.backend.controller;

import com.formapp.backend.model.FormSubmission;
import com.formapp.backend.model.Scenario;
import com.formapp.backend.model.ActivityLog;
import com.formapp.backend.model.Broadcast;
import com.formapp.backend.model.Message;
import com.formapp.backend.service.FormStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

@RestController
@RequestMapping("/api")
public class FormController {

    @Autowired
    private FormStorageService formStorageService;

    @PostMapping("/forms")
    public ResponseEntity<FormSubmission> submitForm(@RequestBody Map<String, Object> formData) {
        String formType = (String) formData.get("formType");
        Object data = formData.get("data");
        
        FormSubmission submission = formStorageService.saveForm(formType, data);
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/forms")
    public ResponseEntity<List<FormSubmission>> getAllForms() {
        List<FormSubmission> forms = formStorageService.getAllForms();
        return ResponseEntity.ok(forms);
    }

    @GetMapping("/forms/{id}")
    public ResponseEntity<FormSubmission> getFormById(@PathVariable String id) {
        FormSubmission form = formStorageService.getFormById(id);
        if (form != null) {
            return ResponseEntity.ok(form);
        }
                return ResponseEntity.notFound().build();
            }
            
    @PutMapping("/forms/{id}")
    public ResponseEntity<FormSubmission> updateForm(@PathVariable String id, @RequestBody Map<String, Object> formData) {
        String formType = (String) formData.get("formType");
        Object data = formData.get("data");
            
        FormSubmission updatedForm = formStorageService.updateForm(id, formType, data);
        if (updatedForm != null) {
            return ResponseEntity.ok(updatedForm);
        }
                return ResponseEntity.notFound().build();
            }
            
    @DeleteMapping("/forms/{id}")
    public ResponseEntity<Void> deleteForm(@PathVariable String id) {
        formStorageService.deleteForm(id);
        return ResponseEntity.ok().build();
            }
            
    @GetMapping("/forms/count")
    public ResponseEntity<Integer> getFormCount() {
        int count = formStorageService.getFormCount();
        return ResponseEntity.ok(count);
    }

    @GetMapping("/forms/type/{formType}")
    public ResponseEntity<List<FormSubmission>> getFormsByType(@PathVariable String formType) {
        List<FormSubmission> forms = formStorageService.getFormsByType(formType);
        return ResponseEntity.ok(forms);
    }

    @GetMapping("/activity-logs")
    public ResponseEntity<List<ActivityLog>> getActivityLogs() {
        List<ActivityLog> logs = formStorageService.getAllActivityLogs();
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/activity-logs/{id}")
    public ResponseEntity<ActivityLog> getActivityLogById(@PathVariable String id) {
        ActivityLog log = formStorageService.getActivityLogById(id);
        if (log != null) {
            return ResponseEntity.ok(log);
        }
                return ResponseEntity.notFound().build();
            }
            
    // Activity log filtreleme endpoint'leri
    @GetMapping("/activity-logs/filter")
    public ResponseEntity<List<ActivityLog>> getFilteredActivityLogs(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) String messageType,
            @RequestParam(required = false) Integer limit) {
        
        // Mesaj tipine göre filtreleme dahil gelişmiş filtreleme
        List<ActivityLog> logs = formStorageService.getActivityLogsWithAllFilters(action, entityType, messageType, limit);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/activity-logs/action/{action}")
    public ResponseEntity<List<ActivityLog>> getActivityLogsByAction(
            @PathVariable String action,
            @RequestParam(required = false) Integer limit) {
        
        List<ActivityLog> logs = formStorageService.getActivityLogsByAction(action, limit);
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/activity-logs/entity/{entityType}")
    public ResponseEntity<List<ActivityLog>> getActivityLogsByEntityType(
            @PathVariable String entityType,
            @RequestParam(required = false) Integer limit) {
        
        List<ActivityLog> logs = formStorageService.getActivityLogsByEntityType(entityType, limit);
        return ResponseEntity.ok(logs);
    }

    // Mesaj tipine göre filtreleme endpoint'i
    @GetMapping("/activity-logs/message-type/{messageType}")
    public ResponseEntity<List<ActivityLog>> getActivityLogsByMessageType(
            @PathVariable String messageType,
            @RequestParam(required = false) Integer limit) {
        
        List<ActivityLog> logs = formStorageService.getActivityLogsByMessageType(messageType, limit);
        return ResponseEntity.ok(logs);
    }
            
    @PostMapping("/broadcasts")
    public ResponseEntity<Broadcast> createBroadcast(@RequestBody Broadcast broadcast) {
        Broadcast savedBroadcast = formStorageService.saveBroadcast(broadcast);
        return ResponseEntity.ok(savedBroadcast);
            }
            
    @GetMapping("/broadcasts")
    public ResponseEntity<List<Broadcast>> getAllBroadcasts() {
        List<Broadcast> broadcasts = formStorageService.getBroadcasts();
        return ResponseEntity.ok(broadcasts);
    }

    @GetMapping("/broadcasts/{id}")
    public ResponseEntity<Broadcast> getBroadcastById(@PathVariable String id) {
        Optional<Broadcast> broadcast = formStorageService.getBroadcastById(id);
        return broadcast.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/broadcasts/{id}")
    public ResponseEntity<Void> deleteBroadcast(@PathVariable String id) {
        formStorageService.deleteBroadcast(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/broadcasts/{id}/status")
    public ResponseEntity<Void> updateBroadcastStatus(@PathVariable String id, @RequestBody Map<String, Boolean> status) {
        Boolean active = status.get("active");
        if (active != null) {
            formStorageService.updateBroadcastStatus(id, active);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
            }

    @PutMapping("/broadcasts/{id}/tcp-status")
    public ResponseEntity<Void> updateBroadcastTcpStatus(@PathVariable String id, @RequestBody Map<String, Boolean> status) {
        Boolean tcpSent = status.get("tcpSent");
        if (tcpSent != null) {
            formStorageService.updateBroadcastTcpStatus(id, tcpSent);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/broadcasts/active")
    public ResponseEntity<List<Broadcast>> getActiveBroadcasts() {
        List<Broadcast> broadcasts = formStorageService.getActiveBroadcasts();
        return ResponseEntity.ok(broadcasts);
            }
            
    @GetMapping("/broadcasts/tcp-sent")
    public ResponseEntity<List<Broadcast>> getTcpSentBroadcasts() {
        List<Broadcast> broadcasts = formStorageService.getTcpSentBroadcasts();
        return ResponseEntity.ok(broadcasts);
    }

    // Scenario endpoints
    @PostMapping("/scenarios")
    public ResponseEntity<Scenario> createScenario(@RequestBody Scenario scenario) {
            Scenario savedScenario = formStorageService.saveScenario(scenario);
            return ResponseEntity.ok(savedScenario);
    }

    @GetMapping("/scenarios")
    public ResponseEntity<List<Scenario>> getAllScenarios() {
            List<Scenario> scenarios = formStorageService.getAllScenarios();
            return ResponseEntity.ok(scenarios);
    }

    @GetMapping("/scenarios/{id}")
    public ResponseEntity<Scenario> getScenarioById(@PathVariable String id) {
            Scenario scenario = formStorageService.getScenarioById(id);
            if (scenario != null) {
            return ResponseEntity.ok(scenario);
        }
                return ResponseEntity.notFound().build();
            }

    @GetMapping("/scenarios/broadcast/{broadcastId}")
    public ResponseEntity<Scenario> getScenarioByBroadcastId(@PathVariable String broadcastId) {
        Scenario scenario = formStorageService.getScenarioByBroadcastId(broadcastId);
        if (scenario != null) {
            return ResponseEntity.ok(scenario);
        }
                return ResponseEntity.notFound().build();
            }

    @PutMapping("/scenarios/{id}")
    public ResponseEntity<Scenario> updateScenario(@PathVariable String id, @RequestBody Scenario scenario) {
        Scenario updatedScenario = formStorageService.updateScenario(id, scenario);
        if (updatedScenario != null) {
            return ResponseEntity.ok(updatedScenario);
        }
                return ResponseEntity.notFound().build();
            }

    @DeleteMapping("/scenarios/{id}")
    public ResponseEntity<Void> deleteScenario(@PathVariable String id) {
        formStorageService.deleteScenario(id);
        return ResponseEntity.ok().build();
    }

    // Message endpoints
    @PostMapping({"/messages", "/forms/message"})
    public ResponseEntity<Message> createMessage(@RequestBody Map<String, Object> messageData) {
        String messageName = (String) messageData.get("messageName");
        // Accept both "type" and "messageType"
        String messageType = (String) (messageData.get("messageType") != null ? messageData.get("messageType") : messageData.get("type"));

        // Parse booleans that might come as String or Boolean
        boolean saveMessage = false;
        if (messageData.containsKey("saveMessage")) {
            Object saveObj = messageData.get("saveMessage");
            saveMessage = !("false".equalsIgnoreCase(String.valueOf(saveObj)) || "0".equals(String.valueOf(saveObj)));
        }
        
        boolean sendMessage = false;
        if (messageData.containsKey("sendMessage")) {
            Object sendObj = messageData.get("sendMessage");
            sendMessage = !("false".equalsIgnoreCase(String.valueOf(sendObj)) || "0".equals(String.valueOf(sendObj)));
    }

        // Convert all other fields to parameters JSON
        Map<String, Object> parameters = new HashMap<>();
        for (Map.Entry<String, Object> entry : messageData.entrySet()) {
            String key = entry.getKey();
            if (!"messageName".equals(key) && !"type".equals(key) && 
                !"messageType".equals(key) && !"saveMessage".equals(key) && !"sendMessage".equals(key)) {
                parameters.put(key, entry.getValue());
            }
        }
        
        String parametersJson = formStorageService.convertMapToJson(parameters);
            
        Message savedMessage = formStorageService.saveMessage(messageName, messageType, parametersJson, saveMessage, sendMessage);
        return ResponseEntity.ok(savedMessage);
    }

    @PutMapping({"/message/{id}", "/forms/message/{id}"})
    public ResponseEntity<Message> updateMessage(@PathVariable String id, @RequestBody Message updatedMessage) {
        Message existingMessage = formStorageService.getMessageById(id);
        if (existingMessage == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Update the message (particularly the sent field)
        existingMessage.setSent(updatedMessage.isSent());
        // Could also update other fields if needed
        if (updatedMessage.getMessageName() != null) {
            existingMessage.setMessageName(updatedMessage.getMessageName());
        }
        
        // Save the updated message
        Message savedMessage = formStorageService.updateMessage(existingMessage);
        return ResponseEntity.ok(savedMessage);
    }
    
    @GetMapping({"/messages", "/forms/messages"})
    public ResponseEntity<List<Message>> getAllMessages() {
            List<Message> messages = formStorageService.getAllMessages();
            return ResponseEntity.ok(messages);
    }

    @GetMapping({"/messages/type/{messageType}", "/forms/messages/type/{messageType}"})
    public ResponseEntity<List<Message>> getMessagesByType(@PathVariable String messageType) {
        List<Message> messages = formStorageService.getMessagesByType(messageType);
            return ResponseEntity.ok(messages);
    }
    
    @DeleteMapping({"/messages/{id}", "/forms/message/{id}"})
    public ResponseEntity<Void> deleteMessage(@PathVariable String id) {
        boolean deleted = formStorageService.deleteMessage(id);
        if (deleted) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Compatibility endpoint for frontend
    @GetMapping("/forms/logs")
    public ResponseEntity<List<ActivityLog>> getAllActivityLogsCompat() {
        return getActivityLogs();
    }
} 