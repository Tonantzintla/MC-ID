package com.mcid.auth.heartbeat;

import com.mcid.auth.config.ConfigLoader;
import org.slf4j.Logger;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class HeartbeatHandler {
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();
    private final URI heartbeatUrl;
    private final Logger logger;

    public HeartbeatHandler(ConfigLoader configLoader, Logger logger) {
        this.logger = logger;
        this.heartbeatUrl = URI.create(configLoader.getConfig().getString("heartbeat.url"));
        int interval = configLoader.getConfig().getInt("heartbeat.interval", 60);

        scheduler.scheduleAtFixedRate(this::sendHeartbeat, 0, interval, TimeUnit.SECONDS);
        logger.info("Heartbeat enabled, pinging {} every {}s", heartbeatUrl, interval);
    }

    private void sendHeartbeat() {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(heartbeatUrl)
                .GET()
                .timeout(Duration.ofSeconds(10))
                .build();

        httpClient.sendAsync(request, HttpResponse.BodyHandlers.discarding())
                .thenAccept(response -> {
                    if (response.statusCode() < 200 || response.statusCode() >= 300) {
                        logger.warn("Heartbeat ping returned status {}", response.statusCode());
                    }
                })
                .exceptionally(err -> {
                    logger.warn("Heartbeat ping failed: {}", err.getMessage());
                    return null;
                });
    }

    public void shutdown() {
        scheduler.shutdown();
    }
}
