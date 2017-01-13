/// <binding ProjectOpened='default' />
var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
	pattern: '*'
});

var utf8BOM = String.fromCharCode(65279);

var PATHS = {
	sass: ['src/css/**/*.scss', '!_*.scss'],
	sassWatch: ['src/css/**/*.scss'],
	assets: ['src/**/*', '!src/css/**/*', '!src/html/**/*', '!src/html', '!src/js/**/*'],
	html: ['src/html/*.html'],
	htmlWatch: ['src/html/**/*.html'],
	js: ['src/js/vendors/**/jquery-*.js', 'src/js/vendors/**/*.js', 'src/js/application/jquery*.js', 'src/js/application/*.js'],
	jsWatch: ['src/js/**/*.js'],
	images: ['src/images/**/*'],
	dist: 'dist/'
};

gulp.task('sass', function () {
	var processors = [
        $.autoprefixer({ browsers: ['last 2 version'] }),
		$.cssMqpacker({
			sort: true
		})
	];

	return gulp.src(PATHS.sass)
        .pipe($.plumber())
        .pipe($.sass({ style: 'expanded' }).on('error', $.sass.logError))
        .pipe($.postcss(processors))
        .pipe($.cleanCss({ compatibility: 'ie9', advanced: false }))
        .pipe(gulp.dest(PATHS.dist + 'css'))
		.pipe($.browserSync.stream())
        .pipe($.rename({ extname: '.min.css' }))
        .pipe(gulp.dest(PATHS.dist + 'css'));
});

gulp.task('js', function () {
	return gulp.src(PATHS.js)
		.pipe($.concat('scripts.js'))
		//.pipe($.uglify())
		.pipe(gulp.dest(PATHS.dist + 'js'));
});

gulp.task('fileinclude', function () {
	return gulp.src(PATHS.html)
		.pipe($.fileInclude({
			prefix: '@@',
			basepath: '@file'
		}))
		.pipe($.replace(utf8BOM, ''))
		.pipe(gulp.dest(PATHS.dist))
		.pipe($.browserSync.stream());
});

gulp.task('clean', function () {
	return gulp.src(PATHS.dist)
		.pipe($.clean({ force: true }));
});

gulp.task('copyFiles', function () {
	return gulp.src(PATHS.assets)
		.pipe(gulp.dest(PATHS.dist));		
});

gulp.task('optimizeImages', function () {
	return gulp.src(PATHS.images)
		.pipe($.imagemin())
		.pipe(gulp.dest('src/images/'));
});

gulp.task('watch', function () {
	$.browserSync.init({
		server: {
			baseDir: './dist'
		}
	});

	gulp.watch(PATHS.sassWatch, ['sass']);
	gulp.watch(PATHS.htmlWatch, ['fileinclude']);
	gulp.watch(PATHS.jsWatch, ['copyFiles', 'js']);
});

gulp.task('default', ['watch']);

gulp.task('build', ['copyFiles', 'sass', 'js', 'fileinclude']);
