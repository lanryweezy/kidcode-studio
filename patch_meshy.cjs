const fs = require('fs');
let code = fs.readFileSync('src/services/ai3DService.ts', 'utf8');

const meshySearch = `  async generateFromText(
    prompt: string,
    style: string = 'cartoon',
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<Generated3DAsset> {
    if (!MESHY_API_KEY) {
      throw new Error('Meshy API key not configured');
    }

    // Step 1: Create task
    const createResponse = await fetch(\`\${MESHY_API_BASE}/image-to-3d\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${MESHY_API_KEY}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        style: style,
        format: 'glb' as const,
        enable_pbr: true,
        enable_rig: false
      })
    });

    if (!createResponse.ok) {
      throw new Error(\`Meshy API error: \${createResponse.statusText}\`);
    }

    const createData = await createResponse.json();
    const taskId = createData.id;

    // Step 2: Poll for completion
    onProgress?.({ status: 'processing', progress: 10, message: 'Generating 3D model...' });

    while (true) {
      const statusResponse = await fetch(\`\${MESHY_API_BASE}/tasks/\${taskId}\`, {
        headers: {
          'Authorization': \`Bearer \${MESHY_API_KEY}\`
        }
      });

      const statusData = await statusResponse.json();

      if (statusData.status === 'succeeded') {
        onProgress?.({ status: 'complete', progress: 100, message: 'Generation complete!' });

        return {
          id: taskId,
          url: statusData.output.model,
          thumbnailUrl: statusData.output.thumbnail || '',
          format: 'glb' as const,
          vertices: statusData.output.vertex_count || 5000,
          textures: ['diffuse', 'normal', 'roughness', 'metallic'],
          isRigged: false,
          provider: 'meshy',
          prompt: prompt,
          createdAt: Date.now()
        };
      } else if (statusData.status === 'failed') {
        throw new Error('Meshy generation failed');
      }

      onProgress?.({
        status: 'processing',
        progress: statusData.progress || 50,
        message: \`Generating... \${statusData.progress || 50}%\`
      });

      await sleep(3000); // Poll every 3 seconds
    }
  },

  /**
   * Generate 3D model from image
   */
  async generateFromImage(
    imageUrl: string,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<Generated3DAsset> {
    if (!MESHY_API_KEY) {
      throw new Error('Meshy API key not configured');
    }

    // Step 1: Create task
    const createResponse = await fetch(\`\${MESHY_API_BASE}/image-to-3d\`, {
      method: 'POST',
      headers: {
        'Authorization': \`Bearer \${MESHY_API_KEY}\`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image_url: imageUrl,
        format: 'glb' as const,
        enable_pbr: true,
        enable_rig: false
      })
    });

    if (!createResponse.ok) {
      throw new Error(\`Meshy API error: \${createResponse.statusText}\`);
    }

    const createData = await createResponse.json();
    const taskId = createData.id;

    // Step 2: Poll for completion
    onProgress?.({ status: 'processing', progress: 10, message: 'Processing image...' });

    while (true) {
      const statusResponse = await fetch(\`\${MESHY_API_BASE}/tasks/\${taskId}\`, {
        headers: {
          'Authorization': \`Bearer \${MESHY_API_KEY}\`
        }
      });

      const statusData = await statusResponse.json();

      if (statusData.status === 'succeeded') {
        onProgress?.({ status: 'complete', progress: 100, message: 'Generation complete!' });

        return {
          id: taskId,
          url: statusData.output.model,
          thumbnailUrl: statusData.output.thumbnail || '',
          format: 'glb' as const,
          vertices: statusData.output.vertex_count || 5000,
          textures: ['diffuse', 'normal', 'roughness', 'metallic'],
          isRigged: false,
          provider: 'meshy',
          prompt: 'Image upload',
          createdAt: Date.now()
        };
      } else if (statusData.status === 'failed') {
        throw new Error('Meshy generation failed');
      }

      onProgress?.({
        status: 'processing',
        progress: statusData.progress || 50,
        message: \`Processing... \${statusData.progress || 50}%\`
      });

      await sleep(3000); // Poll every 3 seconds
    }
  }`;

const meshyReplace = `  async generateFromText(
    prompt: string,
    style: string = 'cartoon',
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<Generated3DAsset> {
    if (!MESHY_API_KEY) {
      throw new Error('Meshy API key not configured');
    }

    return executeWithRetry(async () => {
        // Step 1: Create task
        const createResponse = await fetch(\`\${MESHY_API_BASE}/text-to-3d\`, {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${MESHY_API_KEY}\`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: prompt,
            style: style,
            format: 'glb',
            enable_pbr: true,
            enable_rig: false
          })
        });

        if (!createResponse.ok) {
          throw new Error(\`Meshy API error: \${createResponse.statusText}\`);
        }

        const createData = await createResponse.json();
        const taskId = createData.id;

        // Step 2: Poll for completion
        onProgress?.({ status: 'processing', progress: 10, message: 'Generating 3D model...' });

        while (true) {
          const statusResponse = await fetch(\`\${MESHY_API_BASE}/tasks/\${taskId}\`, {
            headers: {
              'Authorization': \`Bearer \${MESHY_API_KEY}\`
            }
          });

          const statusData = await statusResponse.json();

          if (statusData.status === 'succeeded') {
            onProgress?.({ status: 'complete', progress: 100, message: 'Generation complete!' });

            return {
              id: taskId,
              url: statusData.output.model,
              thumbnailUrl: statusData.output.thumbnail || '',
              format: 'glb' as const,
              vertices: statusData.output.vertex_count || 5000,
              textures: ['diffuse', 'normal', 'roughness', 'metallic'],
              isRigged: false,
              provider: 'meshy',
              prompt: prompt,
              createdAt: Date.now()
            };
          } else if (statusData.status === 'failed') {
            throw new Error('Meshy generation failed');
          }

          onProgress?.({
            status: 'processing',
            progress: statusData.progress || 50,
            message: \`Generating... \${statusData.progress || 50}%\`
          });

          await sleep(3000); // Poll every 3 seconds
        }
    }, RetryPresets.slow, 'meshy').catch(error => {
      onProgress?.({
        status: 'error',
        progress: 0,
        message: 'Meshy generation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    });
  },

  /**
   * Generate 3D model from image
   */
  async generateFromImage(
    imageUrl: string,
    onProgress?: (progress: GenerationProgress) => void
  ): Promise<Generated3DAsset> {
    if (!MESHY_API_KEY) {
      throw new Error('Meshy API key not configured');
    }

    return executeWithRetry(async () => {
        // Step 1: Create task
        const createResponse = await fetch(\`\${MESHY_API_BASE}/image-to-3d\`, {
          method: 'POST',
          headers: {
            'Authorization': \`Bearer \${MESHY_API_KEY}\`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            image_url: imageUrl,
            format: 'glb',
            enable_pbr: true,
            enable_rig: false
          })
        });

        if (!createResponse.ok) {
          throw new Error(\`Meshy API error: \${createResponse.statusText}\`);
        }

        const createData = await createResponse.json();
        const taskId = createData.id;

        // Step 2: Poll for completion
        onProgress?.({ status: 'processing', progress: 10, message: 'Processing image...' });

        while (true) {
          const statusResponse = await fetch(\`\${MESHY_API_BASE}/tasks/\${taskId}\`, {
            headers: {
              'Authorization': \`Bearer \${MESHY_API_KEY}\`
            }
          });

          const statusData = await statusResponse.json();

          if (statusData.status === 'succeeded') {
            onProgress?.({ status: 'complete', progress: 100, message: 'Generation complete!' });

            return {
              id: taskId,
              url: statusData.output.model,
              thumbnailUrl: statusData.output.thumbnail || '',
              format: 'glb' as const,
              vertices: statusData.output.vertex_count || 5000,
              textures: ['diffuse', 'normal', 'roughness', 'metallic'],
              isRigged: false,
              provider: 'meshy',
              prompt: 'Image upload',
              createdAt: Date.now()
            };
          } else if (statusData.status === 'failed') {
            throw new Error('Meshy generation failed');
          }

          onProgress?.({
            status: 'processing',
            progress: statusData.progress || 50,
            message: \`Processing... \${statusData.progress || 50}%\`
          });

          await sleep(3000); // Poll every 3 seconds
        }
    }, RetryPresets.slow, 'meshy').catch(error => {
      onProgress?.({
        status: 'error',
        progress: 0,
        message: 'Meshy generation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    });
  }`;

code = code.replace(meshySearch, meshyReplace);
fs.writeFileSync('src/services/ai3DService.ts', code);
