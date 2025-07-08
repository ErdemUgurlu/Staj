package com.formapp.backend.service;

import com.formapp.backend.model.*;
import jakarta.xml.bind.JAXBContext;
import jakarta.xml.bind.JAXBException;
import jakarta.xml.bind.Marshaller;
import jakarta.xml.bind.Unmarshaller;
import jakarta.xml.bind.annotation.*;
import org.springframework.stereotype.Service;

import java.io.File;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class XmlStorageService {
    private static final String DATA_DIR = "data";
    private static final String BROADCASTS_FILE = DATA_DIR + "/broadcasts.xml";
    private static final String MESSAGES_FILE = DATA_DIR + "/messages.xml";
    private static final String SCENARIOS_FILE = DATA_DIR + "/scenarios.xml";
    private static final String ACTIVITY_LOGS_FILE = DATA_DIR + "/activity_logs.xml";

    public XmlStorageService() {
        // Create data directory if it doesn't exist
        new File(DATA_DIR).mkdirs();
    }

    @XmlRootElement(name = "broadcasts")
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class BroadcastList {
        @XmlElement(name = "broadcast")
        private List<Broadcast> broadcasts = new ArrayList<>();

        public List<Broadcast> getBroadcasts() {
            return broadcasts;
        }

        public void setBroadcasts(List<Broadcast> broadcasts) {
            this.broadcasts = broadcasts;
        }
    }

    @XmlRootElement(name = "messages")
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class MessageList {
        @XmlElement(name = "message")
        private List<Message> messages = new ArrayList<>();

        public List<Message> getMessages() {
            return messages;
        }

        public void setMessages(List<Message> messages) {
            this.messages = messages;
        }
    }

    @XmlRootElement(name = "scenarios")
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class ScenarioList {
        @XmlElement(name = "scenario")
        private List<Scenario> scenarios = new ArrayList<>();

        public List<Scenario> getScenarios() {
            return scenarios;
        }

        public void setScenarios(List<Scenario> scenarios) {
            this.scenarios = scenarios;
        }
    }

    @XmlRootElement(name = "activityLogs")
    @XmlAccessorType(XmlAccessType.FIELD)
    public static class ActivityLogList {
        @XmlElement(name = "activityLog")
        private List<ActivityLog> activityLogs = new ArrayList<>();

        public List<ActivityLog> getActivityLogs() {
            return activityLogs;
        }

        public void setActivityLogs(List<ActivityLog> activityLogs) {
            this.activityLogs = activityLogs;
        }
    }

    // Broadcast methods
    public List<Broadcast> loadBroadcasts() {
        try {
            File file = new File(BROADCASTS_FILE);
            if (!file.exists()) {
                return new ArrayList<>();
            }
            JAXBContext context = JAXBContext.newInstance(BroadcastList.class);
            Unmarshaller unmarshaller = context.createUnmarshaller();
            BroadcastList list = (BroadcastList) unmarshaller.unmarshal(file);
            return list.getBroadcasts();
        } catch (JAXBException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public void saveBroadcasts(List<Broadcast> broadcasts) {
        try {
            JAXBContext context = JAXBContext.newInstance(BroadcastList.class);
            Marshaller marshaller = context.createMarshaller();
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
            BroadcastList list = new BroadcastList();
            list.setBroadcasts(broadcasts);
            marshaller.marshal(list, new File(BROADCASTS_FILE));
        } catch (JAXBException e) {
            e.printStackTrace();
        }
    }

    // Message methods
    public List<Message> loadMessages() {
        try {
            File file = new File(MESSAGES_FILE);
            if (!file.exists()) {
                return new ArrayList<>();
            }
            JAXBContext context = JAXBContext.newInstance(MessageList.class);
            Unmarshaller unmarshaller = context.createUnmarshaller();
            MessageList list = (MessageList) unmarshaller.unmarshal(file);
            return list.getMessages();
        } catch (JAXBException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public void saveMessages(List<Message> messages) {
        try {
            JAXBContext context = JAXBContext.newInstance(MessageList.class);
            Marshaller marshaller = context.createMarshaller();
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
            MessageList list = new MessageList();
            list.setMessages(messages);
            marshaller.marshal(list, new File(MESSAGES_FILE));
        } catch (JAXBException e) {
            e.printStackTrace();
        }
    }

    // Scenario methods
    public List<Scenario> loadScenarios() {
        try {
            File file = new File(SCENARIOS_FILE);
            if (!file.exists()) {
                return new ArrayList<>();
            }
            JAXBContext context = JAXBContext.newInstance(ScenarioList.class);
            Unmarshaller unmarshaller = context.createUnmarshaller();
            ScenarioList list = (ScenarioList) unmarshaller.unmarshal(file);
            return list.getScenarios();
        } catch (JAXBException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public void saveScenarios(List<Scenario> scenarios) {
        try {
            JAXBContext context = JAXBContext.newInstance(ScenarioList.class);
            Marshaller marshaller = context.createMarshaller();
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
            ScenarioList list = new ScenarioList();
            list.setScenarios(scenarios);
            marshaller.marshal(list, new File(SCENARIOS_FILE));
        } catch (JAXBException e) {
            e.printStackTrace();
        }
    }

    // ActivityLog methods
    public List<ActivityLog> loadActivityLogs() {
        try {
            File file = new File(ACTIVITY_LOGS_FILE);
            if (!file.exists()) {
                return new ArrayList<>();
            }
            JAXBContext context = JAXBContext.newInstance(ActivityLogList.class);
            Unmarshaller unmarshaller = context.createUnmarshaller();
            ActivityLogList list = (ActivityLogList) unmarshaller.unmarshal(file);
            return list.getActivityLogs();
        } catch (JAXBException e) {
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public void saveActivityLogs(List<ActivityLog> activityLogs) {
        try {
            JAXBContext context = JAXBContext.newInstance(ActivityLogList.class);
            Marshaller marshaller = context.createMarshaller();
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true);
            ActivityLogList list = new ActivityLogList();
            list.setActivityLogs(activityLogs);
            marshaller.marshal(list, new File(ACTIVITY_LOGS_FILE));
        } catch (JAXBException e) {
            e.printStackTrace();
        }
    }
} 