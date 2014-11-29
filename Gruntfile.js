//@charset "utf-8";
/**
 * 前端资源文件部署
 * @author huixisheng
 * @blog http://huixisheng.github.io/
 * @date 2014-11-29 16:36:41
 *
 * @Todo
 * 1. 对上传服务器的文件做是否存在检测
 * 2. gulp
 * 3. 智能的node生成脚本
 */

module.exports = function(grunt) {

    var homeDir = process.env.HOME || process.env.USERPROFILE;
    if (!homeDir) {
        homeDir = process.env.HOMEDRIVE + process.env.HOMEPATH;
    }

    var path = require('path');
    var config = require(path.join(homeDir, '.smm/config.js'));

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        copy: {

            dist: {
                expand: true,
                // cwd: 'src/WeixinApi/',
                src: ['src/<%= pkg.name %>.js'],
                dest: 'dist/<%= pkg.name %>/<%= pkg.version %>/',
                ext: '-debug.js',
                flatten: true
            },

            localhost: {
                expand: true,
                src: [
                    'dist/<%= pkg.name %>/<%= pkg.version %>/*.js'
                ],
                dest: config.localhost.staticRoot +
                    's/<%= pkg.name %>/<%= pkg.version %>/',
                flatten: true
            },

            sls: {
                expand: true,
                src: [
                    'dist/<%= pkg.name %>/<%= pkg.version %>/*.js'
                ],
                dest: config.sls.staticRoot +
                    's/<%= pkg.name %>/<%= pkg.version %>/',
                flatten: true
            }

        },


        uglify: {
            options: {
                report: 'gzip',
                ASCIIOnly: true,
                banner: '/* author:<%= pkg.author %>  <%= pkg.name %>-<%= pkg.version %>' +
                    ' <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },

            dist: {
                // banner: '//@charset "utf-8"\n/*! pageSlide-1.0.0' + '<%= grunt.template.today("yyyy-mm-dd") %> */',
                files: {
                    'dist/<%= pkg.name %>/<%= pkg.version %>/<%= pkg.name %>.js': [
                        'src/<%= pkg.name %>.js'
                    ]
                }
            }
        },



        shell: {
            options: {
                stderr: false
            },
            target: {
                command: ['cd ' + config.localhost.staticRoot,
                    'node showList.js'
                ].join('&&')
            }
        },


        scp: {
            options: config.server,
            dist: {
                files: [{
                    // expand: true,
                    cwd: 'dist/<%= pkg.name %>/<%= pkg.version %>',
                    //src: ['**/*.js', '**/*.css'], // 把文件当成文件夹建?? Todo why?
                    src: '**/*',
                    filter: 'isFile',
                    // flatten: true,
                    // path on the server
                    dest: config.server.staticRoot +
                        's/<%= pkg.name %>/<%= pkg.version %>'
                }]
            },
        },

        clean: {
            dist: ['dist']
        }
    });

    require('load-grunt-tasks')(grunt);

    grunt.registerTask('default', ['clean', 'copy:dist', 'uglify',
        'copy:localhost', 'copy:sls', 'scp', 'shell'
    ]);

};
