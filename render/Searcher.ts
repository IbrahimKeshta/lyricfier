import {SearchLyrics} from './plugins/SearchLyrics';
import {SearchWikia} from "./plugins/SearchWikia";
import {MusicMatch} from "./plugins/MusicMatch";
const async = require('async');
const plugins = [MusicMatch, SearchWikia];
const request = require('request').defaults({timeout: 5000});

interface Result {
    lyric : string;
    sourceName : string;
    sourceUrl : string;
}

export class Searcher {
    protected plugins:SearchLyrics[];

    constructor() {
        this.loadPlugins();
    }

    loadPlugins() {
        this.plugins = plugins.map((Plugin) => {
            return new Plugin(request);
        });
    }

    search(title:string, artist:string, cb : (error : any, result : Result) => void) {
        const from = { lyric: null, sourceName: '', sourceUrl: ''};
        // run plugins on series
        // if some returns success getting a lyric
        // stop and save the lyric result
        async.detectSeries(this.plugins, (plugin : SearchLyrics, callback) => {
            plugin.search(title, artist, (err, result) => {
                if (!err) {
                    from.lyric = result.lyric;
                    from.sourceName = plugin.name;
                    from.sourceUrl = result.url;
                }
                callback(null, from)
            })
        }, (err) => {
            cb(err, from);
        });
    }
}
