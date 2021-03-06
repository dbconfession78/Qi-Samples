

//function to create client object
var sdsObjs = require("./SdsObjects.js");
var restCall = require("request-promise");

String.prototype.format = function (args) {
    var str = this;
    return str.replace(String.prototype.format.regex, function (item) {
        var intVal = parseInt(item.substring(1, item.length - 1));
        var replace;
        if (intVal >= 0) {
            replace = args[intVal];
        } else if (intVal === -1) {
            replace = "{";
        } else if (intVal === -2) {
            replace = "}";
        } else {
            replace = "";
        }
        return replace;
    });
};
String.prototype.format.regex = new RegExp("{-?[0-9]+}", "g");

module.exports = {
    SdsClient: function (url) {
        this.url = url;
        this.version = 0.1;
        this.typesBase = "/api/Tenants/{0}/Namespaces/{1}/Types";
        this.streamsBase = "/api/Tenants/{0}/Namespaces/{1}/Streams";
        this.viewsBase = "/api/Tenants/{0}/Namespaces/{1}/Views";
        this.insertSingleValueBase = "/Data/InsertValue";
        this.insertMultipleValuesBase = "/Data/InsertValues";
        this.getLastValueBase = "/{0}/Data/GetLastValue";
        this.getWindowValuesBase = "/{0}/Data/GetWindowValues?startIndex={1}&endIndex={2}";
        this.getRangeValuesBase = "/{0}/Data/GetRangeValues?startIndex={1}&skip={2}&count={3}&reversed={4}&boundaryType={5}&viewId={6}";
        this.updateSingleValueBase = "/Data/UpdateValue";
        this.updateMultipleValuesBase = "/Data/UpdateValues";
        this.replaceSingleValueBase = "/Data/ReplaceValue";
        this.replaceMultipleValuesBase = "/Data/ReplaceValues";
        this.removeSingleValueBase = "/{0}/Data/RemoveValue?index={1}";
        this.removeMultipleValuesBase = "/{0}/Data/RemoveWindowValues?startIndex={1}&endIndex={2}";
        this.token = "";
        this.tokenExpires = "";

        // returns an access token
        this.getToken = function (authItems) {
            return restCall({
                url: authItems["authority"],
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                form: {
                    'grant_type': 'client_credentials',
                    'client_id': authItems['clientId'],
                    'client_secret': authItems['clientSecret'],
                    'resource': authItems['resource']
                }
            });
        };

        // create a type
        this.createType = function (tenantId, namespaceId, type) {
            return restCall({
                url: this.url + this.typesBase.format([tenantId, namespaceId]) + "/" + type.Id,
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(type).toString()
            });
        };

        // create a stream under the Sds Service
        this.createStream = function (tenantId, namespaceId, stream) {
            return restCall({
                url: this.url + this.streamsBase.format([tenantId, namespaceId]) + "/" + stream.Id,
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(stream).toString()
            });
        };

        // get streams from the Sds Service
        this.getStreams = function (tenantId, namespaceId, queryString, skip, count) {
            return restCall({
                url: this.url + this.streamsBase.format([tenantId, namespaceId]) + "?" + "query=" + queryString,
                method: 'GET',
                headers: this.getHeaders()
            });
        };

        // create a streamView
        this.createView = function (tenantId, namespaceId, view) {
            return restCall({
                url: this.url + this.viewsBase.format([tenantId, namespaceId]) + "/" + view.Id,
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(view).toString()
            });
        };

        // get an SdsViewMap
        this.getViewMap = function (tenantId, namespaceId, viewId) {
            return restCall({
                url: this.url + this.viewsBase.format([tenantId, namespaceId]) + "/" + viewId + "/Map",
                method: 'GET',
                headers: this.getHeaders()
            });
        };

        // create tags
        this.updateTags = function (tenantId, namespaceId, streamId, tags) {
            return restCall({
                url: this.url + this.streamsBase.format([tenantId, namespaceId]) + "/" + streamId + "/Tags",
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(tags)
            });
        };

        // create metadata
        this.updateMetadata = function (tenantId, namespaceId, streamId, metadata) {
            return restCall({
                url: this.url + this.streamsBase.format([tenantId, namespaceId]) + "/" + streamId + "/Metadata",
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(metadata)
            });
        };

        // get tags
        this.getTags = function (tenantId, namespaceId, streamId) {
            return restCall({
                url: this.url + this.streamsBase.format([tenantId, namespaceId]) + "/" + streamId + "/Tags",
                method: 'GET',
                headers: this.getHeaders()
            });
        };

        // get metadata
        this.getMetadata = function (tenantId, namespaceId, streamId, key) {
            return restCall({
                url: this.url + this.streamsBase.format([tenantId, namespaceId]) + "/" + streamId + "/Metadata/" + key,
                method: 'GET',
                headers: this.getHeaders()
            });
        };

        // insert an event into a stream
        this.insertEvent = function (tenantId, namespaceId, streamId, event) {
            return restCall({
                url: this.url + this.streamsBase.format([tenantId, namespaceId]) + "/" +
                    streamId + this.insertSingleValueBase,
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(event)
            });
        };

        // insert an array of events
        this.insertEvents = function (tenantId, namespaceId, streamId, events) {
            return restCall({
                url: this.url + this.streamsBase.format([tenantId, namespaceId]) + "/" +
                    streamId + this.insertMultipleValuesBase,
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(events)
            });
        };

        // get last value added to stream
        this.getLastValue = function(tenantId, namespaceId, streamId) {
            return restCall({
                url: this.url + this.streamsBase.format([tenantId, namespaceId]) + this.getLastValueBase.format([streamId]),
                method: 'GET',
                headers: this.getHeaders()
            });
        }

        // retrieve a window of events
        this.getWindowValues = function (tenantId, namespaceId, streamId, start, end) {
            return restCall({
                url: this.url + this.streamsBase.format([tenantId, namespaceId]) + this.getWindowValuesBase.format([streamId, start, end]),
                method: 'GET',
                headers: this.getHeaders()
            });
        };

        // retrieve a range of value based on boundary type
        this.getRangeValues = function (tenantId, namespaceId, streamId, start, skip, count, reverse, boundaryType, view ="") {            
            return restCall({
                url: this.url + this.streamsBase.format([tenantId, namespaceId]) + this.getRangeValuesBase.format([streamId, start, skip, count, reverse, boundaryType, view]),
                method: 'GET',
                headers: this.getHeaders()
            });
        };

        // update a stream
        this.updateStream = function (tenantId, namespaceId, stream) {
            return restCall({
                url: this.url + this.streamsBase.format([tenantId, namespaceId]) + "/" + stream.Id,
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(stream).toString()
            });
        };

        // update an event
        this.updateEvent = function (tenantId, namespaceId, streamId, evt) {
            return restCall({
                url: this.url + this.streamsBase.format([tenantId, namespaceId]) + "/" +
                streamId + this.updateSingleValueBase,
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(evt)
            });
        };

        // update an array of events
        this.updateEvents = function (tenantId, namespaceId, streamId, events) {
            return restCall({
                url: this.url + this.streamsBase.format([tenantId, namespaceId]) + "/" +
                streamId + this.updateMultipleValuesBase,
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(events)
            });
        };

        // replace an event
        this.replaceEvent = function (tenantId, namespaceId, streamId, evt) {
            return restCall({
                url: this.url + this.streamsBase.format([tenantId, namespaceId]) + "/" +
                streamId + this.replaceSingleValueBase,
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(evt)
            });
        };

        // replace an array of events
        this.replaceEvents = function (tenantId, namespaceId, streamId, events) {
            return restCall({
                url: this.url + this.streamsBase.format([tenantId, namespaceId]) + "/" +
                streamId + this.replaceMultipleValuesBase,
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(events)
            });
        };

        // delete an event
        this.deleteEvent = function (tenantId, namespaceId, streamId, index) {
            return restCall({
                url: this.url + this.streamsBase.format([tenantId, namespaceId]) + this.removeSingleValueBase.format([streamId, index]),
                method: 'DELETE',
                headers: this.getHeaders()
            });
        };

        // delete a window of events
        this.deleteWindowEvents = function (tenantId, namespaceId, streamId, start, end) {
            return restCall({
                url: this.url + this.streamsBase.format([tenantId, namespaceId]) + this.removeMultipleValuesBase.format([streamId, start, end]),
                method: 'DELETE',
                headers: this.getHeaders()
            });
        };
        
        // delete a type
        this.deleteType = function (tenantId, namespaceId, typeId) {
            return restCall({
                url: this.url + this.typesBase.format([tenantId, namespaceId]) + "/" + typeId,
                method: 'DELETE',
                headers: this.getHeaders()
            });
        };

        // delete a stream
        this.deleteStream = function (tenantId, namespaceId, streamId) {
            return restCall({
                url: this.url + this.streamsBase.format([tenantId, namespaceId]) + "/" + streamId,
                method: 'DELETE',
                headers: this.getHeaders()
            });
        };

        // delete a view
        this.deleteView = function (tenantId, namespaceId, viewId) {
            return restCall({
                url: this.url + this.viewsBase.format([tenantId, namespaceId]) + "/" + viewId,
                method: 'DELETE',
                headers: this.getHeaders()
            });
        };


        this.getHeaders = function () {
            return {
                "Authorization": "bearer " + this.token,
                "Content-type": "application/json",
                "Accept": "*/*; q=1"
            }
        };
    }
};