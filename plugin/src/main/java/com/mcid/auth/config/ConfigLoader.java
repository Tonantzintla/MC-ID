package com.mcid.auth.config;

import dev.dejvokep.boostedyaml.YamlDocument;
import dev.dejvokep.boostedyaml.dvs.versioning.BasicVersioning;
import dev.dejvokep.boostedyaml.settings.dumper.DumperSettings;
import dev.dejvokep.boostedyaml.settings.general.GeneralSettings;
import dev.dejvokep.boostedyaml.settings.loader.LoaderSettings;
import dev.dejvokep.boostedyaml.settings.updater.UpdaterSettings;
import org.slf4j.Logger;

import java.io.File;
import java.io.IOException;
import java.util.Objects;

public class ConfigLoader {
    private final YamlDocument config;
    private final Logger logger;

    public ConfigLoader(File dataFolder, Logger logger) {
        this.logger = logger;

        try {
            this.config = YamlDocument.create(new File(dataFolder, "config.yml"),
                    Objects.requireNonNull(getClass().getResourceAsStream("/config.yml")),
                    GeneralSettings.DEFAULT,
                    LoaderSettings.builder().setAutoUpdate(true).build(),
                    DumperSettings.DEFAULT,
                    UpdaterSettings.builder()
                            .setVersioning(new BasicVersioning("file-version"))
                            .setOptionSorting(UpdaterSettings.OptionSorting.SORT_BY_DEFAULTS).build()
            );
            this.config.update();
            this.config.save();
        } catch (IOException ex) {
            logger.error("Failed to load the config file.", ex);
            throw new IllegalStateException("Failed to load config.yml", ex);
        }
    }

    public YamlDocument getConfig() {
        return config;
    }

    public void save() {
        try {
            config.save();
            this.logger.info("Successfully saved the configuration!");
        } catch (IOException e) {
            this.logger.error("Could not save the configuration.");
        }
    }

    public void reload() {
        try {
            config.reload();
            this.logger.info("Successfully reloaded the configuration!");
        } catch (IOException ex) {
            this.logger.error("Couldn't reload the configuration.");
        }
    }

}
