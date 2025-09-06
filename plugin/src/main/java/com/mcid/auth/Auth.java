package com.mcid.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.inject.Inject;
import com.velocitypowered.api.event.player.ServerPreConnectEvent;
import com.velocitypowered.api.event.proxy.ProxyInitializeEvent;
import com.velocitypowered.api.event.Subscribe;
import com.velocitypowered.api.plugin.Plugin;
import com.velocitypowered.api.plugin.annotation.DataDirectory;
import com.velocitypowered.api.proxy.Player;
import com.velocitypowered.api.proxy.ProxyServer;
import net.kyori.adventure.text.Component;
import net.kyori.adventure.text.format.NamedTextColor;
import net.kyori.adventure.text.format.TextColor;
import net.kyori.adventure.text.minimessage.MiniMessage;
import org.slf4j.Logger;
import com.mcid.auth.api.ApiHandler;
import com.mcid.auth.api.exceptions.PlayerCodeNotFoundException;
import com.mcid.auth.config.ConfigLoader;

import java.net.http.HttpClient;
import java.nio.file.Path;

@Plugin(id = "mc-id-auth", name = "MC-ID Auth", version = BuildConstants.VERSION,authors = {"Tonantzintla"})
public class Auth {

    private final ProxyServer proxy;
    private final Logger logger;
    private final Path dataDir;
    private static final HttpClient httpClient = HttpClient.newHttpClient();
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static final MiniMessage miniMessage = MiniMessage.miniMessage();
    private ApiHandler apiHandler;
    private ConfigLoader config;

    @Inject
    public Auth(ProxyServer proxy, Logger logger, @DataDirectory Path dataDir){
        this.logger = logger;
        this.proxy = proxy;
        this.dataDir=dataDir;

        logger.info("Initialized user auth plugin!");
    }


    @Subscribe
    public void onProxyInitialization(ProxyInitializeEvent event) {
        this.config = new ConfigLoader(dataDir.toFile(),this.logger,proxy);
        this.apiHandler=new ApiHandler(config,this.logger);
    }
    @Subscribe
    public void onServerPreConnect(ServerPreConnectEvent event){
        event.setResult(ServerPreConnectEvent.ServerResult.denied());
        Player player = event.getPlayer();

        this.apiHandler.getPlayerCode(player).thenAccept(playerCodeResponse -> {
            String code = playerCodeResponse.getCode().substring(0, 3) + " " + playerCodeResponse.getCode().substring(3);
            String appName = playerCodeResponse.getAppName();
            Component message = Component
                    .text("Your code for "+appName+" is:\n\n").color(NamedTextColor.GOLD)
                    .append(Component.text(code).color(NamedTextColor.YELLOW));

            player.disconnect(message);
        }).exceptionally(err->{
            if(err.getCause() instanceof PlayerCodeNotFoundException){
                Component message = Component.text("There was no code requested for you.").color(TextColor.color(NamedTextColor.RED));
                player.disconnect(message);
                return null;
            }

            this.logger.error("Something went wrong with the API: {}",err.getMessage());
            player.disconnect(Component.text("Something went wrong.").color(NamedTextColor.DARK_RED));
            return null;
        });
    }


}
