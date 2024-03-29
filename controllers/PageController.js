// controllers/PageController.js
const PageService = require('../services/PageService');
const HttpStatus = require('../utils/ResponseStatus');

const PageController = {
    async createOrUpdatePage(req, res, next) {
        try {
            const page = await PageService.createUpdatePage(req);
            res.status(HttpStatus.OK).json({ message: "Page Updated Successfully" , page});

        } catch (error) {
            next(error);
        }
    },
    async viewPage(req, res, next) {
        try {
            const pageName = req.params.pageName;
            const page = await PageService.getPage(pageName);
            
            if (!page) {
                res.status(HttpStatus.NOT_FOUND).json({ message: "Page not found" });
            }

            res.status(HttpStatus.OK).json(page);
        } catch (error) {
            next(error);
        }
    },
};

module.exports = PageController;
