import {Router} from "express";
import {inference} from "/srv/api/chat/inference";

const router = Router()

router.post('/translate', inference)
