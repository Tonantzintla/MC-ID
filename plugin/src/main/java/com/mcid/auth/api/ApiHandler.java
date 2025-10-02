package com.mcid.auth.api;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.velocitypowered.api.proxy.Player;
import org.slf4j.Logger;
import com.mcid.auth.api.exceptions.PlayerCodeNotFoundException;
import com.mcid.auth.api.responses.PlayerCodeResponse;
import com.mcid.auth.config.ConfigLoader;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.CompletableFuture;

public class ApiHandler {
    private final URI apiEndpoint;
    private final String apiKey;
    private final Logger logger;
    private static final HttpClient httpClient = HttpClient.newHttpClient();
    private static final ObjectMapper objectMapper = new ObjectMapper();

    public ApiHandler(ConfigLoader configLoader, Logger logger){
        this.apiEndpoint=
                URI.create(configLoader.getConfig().getString("api-endpoint"))
                    .resolve("v1/")
                    .resolve("plugin/");
        this.apiKey=configLoader.getConfig().getString("api-key");
        this.logger=logger;

        logger.info("Initialized API at: {}", apiEndpoint.toString());

    }

    public CompletableFuture<PlayerCodeResponse> getPlayerCode(Player player)  {
        URI route = apiEndpoint.resolve("code/").resolve(player.getUniqueId().toString().replace("-",""));

        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(route)
                .header("X-API-Key", apiKey)
                .GET()
                .timeout(Duration.ofSeconds(3))
                .build();


        CompletableFuture<PlayerCodeResponse> playerCodeFuture = new CompletableFuture<>();
        httpClient.sendAsync(httpRequest, HttpResponse.BodyHandlers.ofString())
                .thenAccept(response->{
                    if(response.statusCode()==200){
                        try {
                            PlayerCodeResponse data = objectMapper.readValue(response.body(),PlayerCodeResponse.class);
                            playerCodeFuture.complete(data);
                        } catch (JsonProcessingException e) {
                            throw new RuntimeException(e);
                        }
                    } else if (response.statusCode() == 404) {
                        throw new PlayerCodeNotFoundException("No player code found for player ");
                    } else {
                        throw new RuntimeException("API error: Status " + response.statusCode());
                    }
                })
                .exceptionally(err->{
                    playerCodeFuture.completeExceptionally(err);
                    return null;
                });
        return playerCodeFuture;
    }
}
