const { CosmosClient } = require('@azure/cosmos');

const endpoint = process.env.COSMOS_ENDPOINT;
const key = process.env.COSMOS_KEY;
const client = new CosmosClient({ endpoint, key });

const database = client.database('TasksDB');
const container = database.container('Tasks');

module.exports = async function (context, req) {
    const method = req.method;
    
    try {
        if (method === 'GET') {
            const { resources } = await container.items.readAll().fetchAll();
            context.res = {
                status: 200,
                body: resources
            };
        }
        else if (method === 'POST') {
            const task = {
                id: Date.now().toString(),
                title: req.body.title,
                completed: false,
                createdAt: new Date().toISOString()
            };
            
            await container.items.create(task);
            context.res = {
                status: 201,
                body: task
            };
        }
        else if (method === 'PUT') {
            const id = req.query.id;
            const { resource } = await container.item(id, id).read();
            resource.completed = req.body.completed;
            resource.title = req.body.title || resource.title;
            
            await container.item(id, id).replace(resource);
            context.res = {
                status: 200,
                body: resource
            };
        }
        else if (method === 'DELETE') {
            const id = req.query.id;
            await container.item(id, id).delete();
            context.res = {
                status: 200,
                body: { message: 'Task deleted' }
            };
        }
    } catch (error) {
        context.res = {
            status: 500,
            body: { error: error.message }
        };
    }
};
