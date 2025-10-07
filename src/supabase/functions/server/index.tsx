import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-1227e06f/health", (c) => {
  return c.json({ status: "ok" });
});

// Process and merge Excel files
app.post("/make-server-1227e06f/merge-files", async (c) => {
  try {
    const formData = await c.req.formData();
    const categoryName = formData.get('categoryName') as string;
    const file1 = formData.get('file1') as File;
    const file2 = formData.get('file2') as File;

    if (!categoryName || !file1 || !file2) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    console.log(`Processing files for category: ${categoryName}`);
    console.log(`File 1: ${file1.name} (${file1.size} bytes)`);
    console.log(`File 2: ${file2.name} (${file2.size} bytes)`);

    // In a real implementation, here you would:
    // 1. Parse Excel files using a library like xlsx
    // 2. Extract student data from both files
    // 3. Merge and deduplicate based on email or student ID
    // 4. Return unified data

    // Mock unified data for now
    const unifiedData = [
      {
        id: `${Date.now()}-1`,
        nombre: 'A García López',
        email: 'ana.garcia@estudiante.edu',
        curso: categoryName,
        plataforma_a: 'Presente',
        plataforma_b: 'Activo',
        status: 'Unificado',
        created_at: new Date().toISOString()
      },
      {
        id: `${Date.now()}-2`,
        nombre: 'Carlos Rodríguez Mesa',
        email: 'carlos.rodriguez@estudiante.edu',
        curso: categoryName,
        plataforma_a: 'Presente',
        plataforma_b: 'Inactivo',
        status: 'Pendiente',
        created_at: new Date().toISOString()
      },
      {
        id: `${Date.now()}-3`,
        nombre: 'Elena Martín Ruiz',
        email: 'elena.martin@estudiante.edu',
        curso: categoryName,
        plataforma_a: 'Ausente',
        plataforma_b: 'Activo',
        status: 'Conflicto',
        created_at: new Date().toISOString()
      }
    ];

    // Store the merged data in KV store
    const categoryKey = `category_${categoryName.replace(/\s+/g, '_').toLowerCase()}`;
    await kv.set(categoryKey, unifiedData);

    console.log(`Successfully processed and stored data for category: ${categoryName}`);

    return c.json({
      success: true,
      categoryName,
      data: unifiedData,
      totalRecords: unifiedData.length
    });

  } catch (error) {
    console.error('Error processing files:', error);
    return c.json({ 
      error: "Error processing files", 
      details: error.message 
    }, 500);
  }
});

// Create Outlook category
app.post("/make-server-1227e06f/create-outlook-category", async (c) => {
  try {
    const { categoryName, studentData } = await c.req.json();

    if (!categoryName || !studentData) {
      return c.json({ error: "Missing category name or student data" }, 400);
    }

    console.log(`Creating Outlook category: ${categoryName} with ${studentData.length} contacts`);

    // In a real implementation, here you would:
    // 1. Use Microsoft Graph API to create a new category in Outlook
    // 2. Add each student as a contact in that category
    // 3. Handle authentication and permissions

    // Mock success response
    const categoryId = `category_${Date.now()}`;
    
    // Store category creation record
    await kv.set(`outlook_category_${categoryId}`, {
      categoryName,
      studentCount: studentData.length,
      created_at: new Date().toISOString(),
      status: 'created'
    });

    console.log(`Successfully created Outlook category: ${categoryName}`);

    return c.json({
      success: true,
      categoryId,
      categoryName,
      contactsCreated: studentData.length,
      message: `Categoría "${categoryName}" creada exitosamente en Outlook con ${studentData.length} contactos.`
    });

  } catch (error) {
    console.error('Error creating Outlook category:', error);
    return c.json({ 
      error: "Error creating Outlook category", 
      details: error.message 
    }, 500);
  }
});

// Get category data
app.get("/make-server-1227e06f/category/:name", async (c) => {
  try {
    const categoryName = c.req.param('name');
    const categoryKey = `category_${categoryName.replace(/\s+/g, '_').toLowerCase()}`;
    
    const data = await kv.get(categoryKey);
    
    if (!data) {
      return c.json({ error: "Category not found" }, 404);
    }

    return c.json({
      success: true,
      categoryName,
      data
    });

  } catch (error) {
    console.error('Error fetching category data:', error);
    return c.json({ 
      error: "Error fetching category data", 
      details: error.message 
    }, 500);
  }
});

Deno.serve(app.fetch);