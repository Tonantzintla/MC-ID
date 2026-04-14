package com.mcid.auth.api;

import com.mcid.auth.api.exceptions.PlayerCodeNotFoundException;
import com.mcid.auth.api.exceptions.PluginApiException;
import com.mcid.auth.api.exceptions.PluginApiResponseException;
import com.mcid.auth.api.exceptions.PluginApiUnauthorizedException;
import com.mcid.auth.api.responses.PlayerCodeResponse;
import com.mcid.auth.config.ConfigLoader;
import org.slf4j.Logger;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;

public class ApiHandler {
    private static final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(5))
            .build();
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(3);
    private final URI apiEndpoint;
    private final String apiKey;
    private final Logger logger;

    public ApiHandler(ConfigLoader configLoader, Logger logger) {
        this.logger = logger;
        String baseUrl = configLoader.getConfig().getString("api-endpoint");
        if (!baseUrl.endsWith("/")) {
            baseUrl += "/";
        }
        this.apiEndpoint = URI.create(baseUrl + "api/v1/plugin/");
        this.apiKey = configLoader.getConfig().getString("api-key");

        logger.info("Initialized API at: {}", apiEndpoint);

    }

    public CompletableFuture<PlayerCodeResponse> getPlayerCode(java.util.UUID playerUuid) {
        URI route = apiEndpoint.resolve("code/" + playerUuid.toString().replace("-", ""));

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(route)
                .header("X-API-Key", apiKey)
                .GET()
                .timeout(REQUEST_TIMEOUT)
                .build();

        return httpClient.sendAsync(httpRequest, HttpResponse.BodyHandlers.ofString())
                .thenApply(response -> parseResponse(playerUuid, response.statusCode(), response.body()));
    }

    private PlayerCodeResponse parseResponse(java.util.UUID playerUuid, int statusCode, String responseBody) {
        if (statusCode == 200) {
            try {
                PlayerCodeResponse data = objectMapper.readValue(responseBody, PlayerCodeResponse.class);
                String code = data.getCode();
                if (code == null || !code.matches("\\d{6}")) {
                    throw new PluginApiResponseException("API returned an invalid verification code.");
                }
                return data;
            } catch (JacksonException e) {
                throw new PluginApiResponseException("Failed to parse API response.", e);
            }
        }

        if (statusCode == 404) {
            throw new PlayerCodeNotFoundException("No player code found for player " + playerUuid);
        }

        if (statusCode == 401 || statusCode == 403) {
            throw new PluginApiUnauthorizedException("API credentials were rejected with status " + statusCode + '.');
        }

        logger.warn("MC-ID API returned unexpected status {} for {}", statusCode, playerUuid);
        throw new PluginApiException("API error: Status " + statusCode);
    }
}
