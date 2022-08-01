/* 
Test module
- Obviously just for testing haha
*/
exports.run = (req, res, lang, key) => {
	// returning locked error on wrong key
	if (!key) return res.status(423).send(lang.wrongKey.replace("{{key}}", req.query.key));
	res.send(`Protocol: ${req.protocol}, working!`)
};
