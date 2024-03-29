
"use strict";
module.exports = grunt => {

    var themes = ["alkosto", "kalley", "ktronix", "alkomprar"];

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        clean: {
            dist: ["dist/**/css/*", "dist/**/json/*"]
        },
        cssmin: {
            options: {
                banner: "/*! <%= pkg.name %> - v<%= pkg.version %> */",
                compatibility: "ie8",
                report: "gzip",
                inline: ["local"],
                level: {
                    1: {
                        all: true
                    },
                    2: {
                        all: true
                    }
                }
            },
            dist: {
                expand: true,
                cwd: "dist",
                src: ["**/css/*.css"],
                dest: "dist"
            }
        },
        json_minification: {
            target: {
                files: [{
                    expand: true,
                    cwd: "src/json",
                    src: ["<%= theme %>.json"],
                    dest: "dist/<%= theme %>/json",
                    rename: dest => {
                        return dest + "/service-centers.json";
                    }
                }]
            }
        },
        less: {
            options: {
                banner: "/*! <%= pkg.name %> - v<%= pkg.version %> */",
                compress: true,
                paths: ["dist/css"],
                modifyVars: {
                    themeName: "<%= theme %>"
                }
            },
            theme: {
                files: {
                    "dist/<%= theme %>/css/servicio.css": "src/less/servicio.less"
                }
            }
        },
        themes: themes
    });

    require("load-grunt-tasks")(grunt);

    grunt.registerMultiTask("themes", "Generate styles for each site", function() {
        const done = this.async();
        grunt.log.writeln("Compile less for: " + this.data);
        grunt.config("theme", this.data);
        grunt.task.run("json_minification");
        grunt.task.run("less");
        done();
    });
    grunt.registerTask("default", ["clean", "themes", "cssmin"]);
};