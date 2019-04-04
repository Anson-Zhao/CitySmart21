// config/database.js
var configGlobal = {
    'commondb_connection': {
        'multipleStatements': true,
        'connectionLimit' : 100,
        'host': '10.11.90.15',
        'user': 'AppUser',
        'password': 'Special888%',
        'port'    :  3306
    },
    'session_connection': {
        'multipleStatements': true,
        'connectionLimit' : 100,
        'host': '10.11.90.15',
        'user': 'AppUser',
        'password': 'Special888%',
        'port'    :  3306
    },

    'Session_db': 'CitySmart2',
    'Login_db': 'CitySmart2',
    'Login_table': 'UserLogin',
    'Upload_db': 'CitySmart2',

    'Server_Port': 9086,

    // 'local_URL' : "",
    // 'local_URL' : "http://viewer.usgs.aworldbridgelabs.com",

    'geoServer' : 'http://10.11.90.16:8080/geoserver/',
    'WMS_URL' : 'http://10.11.90.16:8080/geoserver/ows?service=wms&version=1.3.0&request=GetCapabilities',

    // 'Upload_Path': 'http://usgs.aworldbridgelabs.com/uploadfiles',
    'Download_Path':'../config',

    //upload file--pending
    // 'Upload_Path': 'http://usgs.aworldbridgelabs.com/uploadfiles',
    // 'Upload_Path':'uploadfolder',
    // 'Upload_Dir': '/var/www/usgs/uploadfolder',
    'Pending_Dir': 'uploadfolder',
    'Reject_Dir': 'rejectfolder',

    //approve file--active
    // 'GeoData_Dir': '/usr/share/worldwind-geoserver-0.2.1/data_dir/data/USGS'
    'GeoData_Dir':'approvedfolder',

    //trashfolder file--trashfolder
    'Delete_Dir':'trashfolder',

    'num_backups': 4,
    'download_interval': 660000,

    // uswtdb eye distance for placemark layer menu display (km)
    'eyeDistance_PL': 1500,

    // uswtdb eye distance for display heatmap until eyeDistance_Heatmap less than 4500 (km)
    'eyeDistance_Heatmap': 4500,

    // uswtdb initial eye distance (m)
    'eyeDistance_initial': 5000000
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = configGlobal;
} else {
    window.config = configGlobal;
}
