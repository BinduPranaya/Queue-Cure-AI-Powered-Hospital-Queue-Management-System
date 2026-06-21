package com.queuecure.service;

import com.queuecure.dto.AiPredictionRequest;
import com.queuecure.dto.AiPredictionResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Optional;

/**
 * Thin HTTP client for the Queue Cure AI Prediction microservice
 * (FastAPI, see /ai-service). Talks to a single POST /predict endpoint.
 *
 * Deliberately fails soft: if the AI service is down, slow, or returns
 * something unexpected, callers get an empty Optional and should fall
 * back to the deterministic tokensAhead x avgConsultationTime formula.
 * The AI feature should never be able to break the core queue.
 *
 * Uses the plain SimpleClientHttpRequestFactory setter API (stable since
 * Spring 5) rather than Spring Boot's newer fluent
 * ClientHttpRequestFactoryBuilder, whose exact method signatures have
 * changed across 3.4/3.5/4.0 - this keeps the client compiling cleanly
 * regardless of the exact Boot patch version on the classpath.
 */
@Service
@Slf4j
public class AiPredictionClient {

    private final RestClient restClient;

    public AiPredictionClient(@Value("${app.ai-service.base-url}") String baseUrl,
                               @Value("${app.ai-service.timeout-ms:1500}") int timeoutMs) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(timeoutMs);
        requestFactory.setReadTimeout(timeoutMs);

        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .build();
    }

    public Optional<AiPredictionResponse> predict(AiPredictionRequest request) {
        try {
            AiPredictionResponse response = restClient.post()
                    .uri("/predict")
                    .body(request)
                    .retrieve()
                    .body(AiPredictionResponse.class);
            return Optional.ofNullable(response);
        } catch (Exception ex) {
            log.warn("AI prediction service call failed, falling back to formula: {}", ex.getMessage());
            return Optional.empty();
        }
    }
}
