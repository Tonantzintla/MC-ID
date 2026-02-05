package com.mcid.auth.api;

import com.mcid.auth.api.exceptions.PlayerCodeNotFoundException;
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
    private static final HttpClient httpClient = HttpClient.newHttpClient();
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private final URI apiEndpoint;
    private final String apiKey;

    public ApiHandler(ConfigLoader configLoader, Logger logger) {
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
                .timeout(Duration.ofSeconds(3))
                .build();


        CompletableFuture<PlayerCodeResponse> playerCodeFuture = new CompletableFuture<>();
        httpClient.sendAsync(httpRequest, HttpResponse.BodyHandlers.ofString())
                .thenAccept(response -> {
                    if (response.statusCode() == 200) {
                        try {
                            PlayerCodeResponse data = objectMapper.readValue(response.body(), PlayerCodeResponse.class);
                            playerCodeFuture.complete(data);
                        } catch (JacksonException e) {
                            throw new RuntimeException(e);
                        }
                    } else if (response.statusCode() == 404) {
                        throw new PlayerCodeNotFoundException("No player code found for player ");
                    } else {
                        throw new RuntimeException("API error: Status " + response.statusCode());
                    }
                })
                .exceptionally(err -> {
                    playerCodeFuture.completeExceptionally(err);
                    return null;
                });
        return playerCodeFuture;
    }
}
