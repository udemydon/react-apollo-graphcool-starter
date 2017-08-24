/**
 * Created by udemy.don on 2/18/17.
 */
const _Environments = {
    production:
    {
         'GCOOL_ENDPOINT': ''
    },
    dev:
    {
        'GCOOL_ENDPOINT': 'https://api.graph.cool/simple/v1/cj6pfr1my0md00177a4gi1m5s'
    }

}

function getEnvironment() {
    // Insert logic here to get the current platform (e.g. staging, production, etc)
    var platform = getPlatform()

    // ...now return the correct environment
    return _Environments[platform]
}

function getPlatform(){
    return process.env.NODE_ENV || `${process.env.NODE_ENV}`;
}

const Environment = getEnvironment()
export default Environment;
