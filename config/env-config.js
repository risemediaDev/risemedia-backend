const configuration = {
    development:{
        baseUrl: 'http://localhost:5000',
    },
    production:{
        baseUrl: 'https://risemedia.com',
    }
}

const env = process.env.SEVER_ENV || 'development';

let config = configuration[env];

exports.config =  config