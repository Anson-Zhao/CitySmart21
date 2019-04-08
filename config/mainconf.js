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

    //upload path to geoserver when approved
    'geoServer' : 'http://cs.aworldbridgelabs.com:8080/geoserver/',

    //sysnchronization between approvedfolder and data folder under geoserver when approved
    // 'Sync_Dir' : '/usr/share/geoserver-2.15.0/data_dir/data/Approved',
    'Sync_Dir' : 'syncfolder',

    //download/backup wmsCapabilities file (xml)
    'Download_From' : 'https://cors.aworldbridgelabs.com:9084/http://cs.aworldbridgelabs.com:8080/geoserver/ows?service=wms&version=1.3.0&request=GetCapabilities',
    'Download_To':'../config/ows.xml',
    'Backup_Dir':'../config/geoCapacity',

    //upload file--pending
    'Pending_Dir': 'uploadfolder',
    'Reject_Dir': 'rejectfolder',

    //approve file--active
    'Approve_Dir': 'approvedfolder',

    //trashfolder file--trashfolder
    'Delete_Dir': 'trashfolder',

    'num_backups': 24,
    'download_interval': 3600000,

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
