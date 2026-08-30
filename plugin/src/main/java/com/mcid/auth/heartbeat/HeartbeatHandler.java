package com.mcid.auth.heartbeat;

import com.mcid.auth.config.ConfigLoader;
import org.slf4j.Logger;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Locale;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.TimeUnit;

public class HeartbeatHandler {
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor(new HeartbeatThreadFactory());
    private final URI heartbeatUrl;
    private final Logger logger;

    public HeartbeatHandler(ConfigLoader configLoader, Logger logger) {
        this.logger = logger;
        this.heartbeatUrl = validateHeartbeatUrl(configLoader.getConfig().getString("heartbeat.url", ""));
        int interval = configLoader.getConfig().getInt("heartbeat.interval", 60);
        if (interval <= 0) {
            throw new IllegalArgumentException("heartbeat.interval must be greater than zero");
        }

        scheduler.scheduleWithFixedDelay(this::sendHeartbeatSafely, 0, interval, TimeUnit.SECONDS);
        logger.info("Heartbeat enabled, pinging {} every {}s", heartbeatUrl, interval);
    }

    private void sendHeartbeatSafely() {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(heartbeatUrl)
                    .GET()
                    .timeout(Duration.ofSeconds(10))
                    .build();

            HttpResponse<Void> response = httpClient.send(request, HttpResponse.BodyHandlers.discarding());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                logger.warn("Heartbeat ping returned status {}", response.statusCode());
            }
        } catch (InterruptedException error) {
            Thread.currentThread().interrupt();
            logger.debug("Heartbeat ping interrupted during shutdown");
        } catch (Exception error) {
            // Scheduled executors suppress every subsequent run when a task throws.
            logger.warn("Heartbeat ping failed: {}", error.getMessage());
        }
    }

    public void shutdown() {
        scheduler.shutdownNow();
    }

    private static URI validateHeartbeatUrl(String configuredUrl) {
        URI url = URI.create(configuredUrl.trim());
        String scheme = url.getScheme() == null ? "" : url.getScheme().toLowerCase(Locale.ROOT);
        if (!("http".equals(scheme) || "https".equals(scheme)) || url.getHost() == null) {
            throw new IllegalArgumentException("heartbeat.url must be an absolute HTTP(S) URL");
        }
        return url;
    }

    private static final class HeartbeatThreadFactory implements ThreadFactory {
        @Override
        public Thread newThread(Runnable runnable) {
            Thread thread = new Thread(runnable, "mc-id-heartbeat");
            thread.setDaemon(true);
            return thread;
        }
    }
}
