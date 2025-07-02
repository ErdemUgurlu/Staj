package com.formapp.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

	@Bean
	public CorsFilter corsFilter() {
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		CorsConfiguration config = new CorsConfiguration();
		
		// Allow all origins for development
		config.addAllowedOrigin("*");
		
		// Allow all HTTP methods
		config.addAllowedMethod("*");
		
		// Allow all headers
		config.addAllowedHeader("*");
		
		source.registerCorsConfiguration("/**", config);
		return new CorsFilter(source);
	}

} 