/**
 * @swagger
 * /api/friend/friends:
 *   get:
 *     tags: [Friends]
 *     summary: Get user's friends list
 *     description: Retrieve all friends of the authenticated user
 *     responses:
 *       200:
 *         description: Friends list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   friend_id:
 *                     type: integer
 *                     example: 2
 *                   friend_name:
 *                     type: string
 *                     example: Trần Thị B
 *                   avatar_url:
 *                     type: string
 *                     example: /uploads/avatar-456.jpg
 *                   is_online:
 *                     type: boolean
 *                     example: true
 *                   last_active:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/friend/requests:
 *   post:
 *     tags: [Friends]
 *     summary: Send friend request
 *     description: Send a friend request to another user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiver_id
 *             properties:
 *               receiver_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Friend request sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Friend request sent successfully
 *                 request:
 *                   $ref: '#/components/schemas/FriendRequest'
 *       400:
 *         description: Invalid request or already friends/pending
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/friend/requests/sent:
 *   get:
 *     tags: [Friends]
 *     summary: Get sent friend requests
 *     description: Retrieve all friend requests sent by the authenticated user
 *     responses:
 *       200:
 *         description: Sent friend requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FriendRequest'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/friend/requests/received:
 *   get:
 *     tags: [Friends]
 *     summary: Get received friend requests
 *     description: Retrieve all friend requests received by the authenticated user
 *     responses:
 *       200:
 *         description: Received friend requests retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FriendRequest'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/friend/requests/{request_id}/accept:
 *   put:
 *     tags: [Friends]
 *     summary: Accept friend request
 *     description: Accept a received friend request
 *     parameters:
 *       - in: path
 *         name: request_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Friend request ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Friend request accepted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Friend request accepted
 *       400:
 *         description: Invalid request or already processed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Friend request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/friend/requests/{request_id}/decline:
 *   put:
 *     tags: [Friends]
 *     summary: Decline friend request
 *     description: Decline a received friend request
 *     parameters:
 *       - in: path
 *         name: request_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Friend request ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Friend request declined successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Friend request declined
 *       400:
 *         description: Invalid request or already processed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Friend request not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/friend/friends/{friend_id}:
 *   delete:
 *     tags: [Friends]
 *     summary: Unfriend a user
 *     description: Remove a user from friends list
 *     parameters:
 *       - in: path
 *         name: friend_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Friend's user ID
 *         example: 2
 *     responses:
 *       200:
 *         description: Unfriended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unfriended successfully
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Friendship not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/friend/users:
 *   get:
 *     tags: [Friends]
 *     summary: Get all users for search
 *     description: Get all users to search for potential friends
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term to filter users
 *         example: nguyen
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   email:
 *                     type: string
 *                     example: user@example.com
 *                   full_name:
 *                     type: string
 *                     example: Nguyễn Văn A
 *                   avatar_url:
 *                     type: string
 *                     example: /uploads/avatar-123.jpg
 *                   friendship_status:
 *                     type: string
 *                     enum: [none, pending_sent, pending_received, friends]
 *                     example: none
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
