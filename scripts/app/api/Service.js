
let Service = {};



Service.getFromWiki = mapGeo => {
    const LANGUAGE_LINK = app.lang;
        return axios.get('https://' + LANGUAGE_LINK + '.wikipedia.org/w/api.php', {
            params: {
                action: 'query',
                list: 'geosearch',
                gsradius: app.gsradius,
                gscoord: mapGeo ? mapGeo.lat + '|' + mapGeo.lng : app.latitude + '|' + app.longitude,
                format: 'json',
                origin: '*',
            }
        })
        .then(function (response) {
            console.debug(response.data.query);
            return response;
        })
        .catch(function (error) {
            console.error(error);
        })
    }

Service.getDataOnLocations = (title)=> {
    const LANGUAGE_LINK = app.lang;
    return axios.get('https://' + LANGUAGE_LINK + '.wikipedia.org/w/api.php', {
        params: {
            action: 'query',
            titles: title,
            prop: 'extracts|info|images|categories|pageimages',
            inprop: 'url|talkid',
            explaintext: 1,
            pithumbsize: 300,
            format: 'json',
            origin: '*',
            }
       })
        .then(function (response) {
            console.debug(response.data.query);
            return response;
        })
        .catch(function (error) {
            console.error(error);
        })
}



