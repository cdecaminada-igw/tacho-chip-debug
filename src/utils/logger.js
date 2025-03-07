import { Logging } from '@google-cloud/logging';

export const logger = new Logging({
    projectId: process.env.golia_google_project_id
}).log('igw-monito-telemetry-parser');

function log(severity, text, opt) {
    if (process.env.NODE_ENV == 'local')
        return console.log(severity, text);

    logger.write(
        logger.entry({
            resource: {
                type: 'k8s_pod',
                labels: Object.assign(opt || {}, {
                    pod_name: process.env.HOSTNAME || 'igw-monito-telemetry-parser',
                    project_id: process.env.golia_google_project_id
                })
            },
            severity: severity.toUpperCase(),
        }, text)
    );
}

export const info = (text, opt) => log('info', text, opt);
export const warning = (text, opt) => log('warning', text, opt);
export const error = (text, opt) => log('error', text, opt);
export const critical = (text, opt) => log('critical', text, opt);
export const alert = (text, opt) => log('alert', text, opt);
export const debug = (text, opt) => (parseInt(process.env.DEBUG || 0) ? log('info', text, opt) : null);