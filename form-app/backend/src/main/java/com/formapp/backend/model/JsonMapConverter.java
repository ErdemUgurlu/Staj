package com.formapp.backend.model;

import javax.xml.bind.annotation.adapters.XmlAdapter;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

/**
 * XML adapter to marshal/unmarshal Map<String, Object> instances
 * to JSON strings for XML storage.
 */
public class JsonMapConverter extends XmlAdapter<String, Map<String, Object>> {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public Map<String, Object> unmarshal(String v) {
        if (v == null || v.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(v, Map.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to unmarshal JSON", e);
        }
    }

    @Override
    public String marshal(Map<String, Object> v) {
        if (v == null) {
            return null;
        }
        try {
            return objectMapper.writeValueAsString(v);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to marshal to JSON", e);
        }
    }

    /**
     * Static helper method to parse JSON string to Map
     */
    public static Map<String, Object> parseJsonString(String jsonString) {
        if (jsonString == null || jsonString.isEmpty()) {
            return null;
        }
        try {
            return objectMapper.readValue(jsonString, Map.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse JSON string", e);
        }
    }
}