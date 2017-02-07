const tr = require('tor-request')
let argv = require('yargs').argv

let options = {
    url: 'https://api.github.com/users/franciskim/events/public',
    headers: {'user-agent': 'Mozilla/5.0'},
    method: 'GET'
}

const clean = emails => {
    let uniq = emails
        .map((email) => {
            return {count: 1, name: email}
        })
        .reduce((a, b) => {
            a[b.name] = (a[b.name] || 0) + b.count
            return a
        }, {})

    let sorted = Object.keys(uniq).sort((a, b) => uniq[a] < uniq[b])
    return sorted.filter(e => {
        return !e.includes('github.com') && !e.includes('example.com')
    })
}

const process = (options, resolve) => {
    tr.request(options, (err, res, body) => {
        if (res.statusCode !== 200) console.error(`Status code: ${res.statusCode}`)
        else {
            let emails = body.match(/(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/gm)
            if (emails != null && emails.length > 0) {
                emails = clean(emails)
            }
            if (typeof resolve === 'function') {
                // module usage
                resolve(emails)
            }
            else if (argv.user) {
                // CLI usage
                if (emails != null && emails.length > 0) {
                    console.log(emails)
                }
                else console.log('Nothing found!')
            }
        }
    }).on('error', e => {
        console.error(e)
    })
}

if (argv.user) {
    options.url = `https://api.github.com/users/${argv.user}/events/public`
    process(options)
}

module.exports = user => {
    return new Promise(resolve => {
        options.url = `https://api.github.com/users/${user}/events/public`
        process(options, resolve)
    })
}