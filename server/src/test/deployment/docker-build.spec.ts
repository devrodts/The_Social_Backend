import { execSync } from 'child_process';
import { existsSync, statSync } from 'fs';
import * as path from 'path';

describe('T1.1 - Docker Multi-stage Configuration', () => {
  const dockerfilePath = path.join(process.cwd(), 'Dockerfile');
  const dockerignorePath = path.join(process.cwd(), '.dockerignore');
  const dockerComposeProdPath = path.join(process.cwd(), 'docker-compose.prod.yml');

  describe('Docker Files Existence', () => {
    it('should have Dockerfile in project root', () => {
      expect(existsSync(dockerfilePath)).toBe(true);
    });

    it('should have .dockerignore in project root', () => {
      expect(existsSync(dockerignorePath)).toBe(true);
    });

    it('should have docker-compose.prod.yml in project root', () => {
      expect(existsSync(dockerComposeProdPath)).toBe(true);
    });
  });

  describe('Docker Build Performance', () => {
    it('should build Docker image in less than 5 minutes', async () => {
      const startTime = Date.now();
      
      try {
        execSync('docker build -t the-social-backend:test .', { 
          cwd: process.cwd(),
          timeout: 300000 // 5 minutes
        });
        
        const buildTime = (Date.now() - startTime) / 1000;
        expect(buildTime).toBeLessThan(300); // 5 minutes = 300 seconds
      } catch (error) {
        throw new Error(`Docker build failed or exceeded 5 minutes: ${error.message}`);
      }
          }, 400000); // 6.5 minutes timeout for Jest

    it('should produce optimized image smaller than 200MB', () => {
      try {
        const output = execSync('docker image ls the-social-backend:test --format "{{.Size}}"', {
          encoding: 'utf8'
        });
        
        const sizeStr = output.trim();
        const sizeNumber = parseFloat(sizeStr.replace(/[^\d.]/g, ''));
        const unit = sizeStr.replace(/[\d.]/g, '').trim().toUpperCase();
        
        // Convert to MB for comparison
        let sizeInMB: number;
        if (unit.includes('GB')) {
          sizeInMB = sizeNumber * 1024;
        } else if (unit.includes('MB')) {
          sizeInMB = sizeNumber;
        } else if (unit.includes('KB')) {
          sizeInMB = sizeNumber / 1024;
        } else {
          sizeInMB = sizeNumber / (1024 * 1024); // bytes to MB
        }
        
        expect(sizeInMB).toBeLessThan(200);
      } catch (error) {
        throw new Error(`Failed to check image size: ${error.message}`);
      }
    });
  });

  describe('Docker Multi-stage Configuration', () => {
    it('should use multi-stage build pattern', () => {
      if (!existsSync(dockerfilePath)) {
        throw new Error('Dockerfile does not exist');
      }
      
      const dockerfileContent = require('fs').readFileSync(dockerfilePath, 'utf8');
      
      // Check for multiple FROM statements (multi-stage)
      const fromStatements = dockerfileContent.match(/^FROM\s+/gm) || [];
      expect(fromStatements.length).toBeGreaterThanOrEqual(2);
      
      // Check for build stage alias
      expect(dockerfileContent).toMatch(/FROM\s+.+\s+AS\s+\w+/i);
    });

    it('should exclude development dependencies in production image', () => {
      if (!existsSync(dockerfilePath)) {
        throw new Error('Dockerfile does not exist');
      }
      
      const dockerfileContent = require('fs').readFileSync(dockerfilePath, 'utf8');
      
      // Should have npm ci --only=production or npm ci --production
      expect(dockerfileContent).toMatch(/npm ci --(?:only=)?production/);
    });

    it('should use non-root user for security', () => {
      if (!existsSync(dockerfilePath)) {
        throw new Error('Dockerfile does not exist');
      }
      
      const dockerfileContent = require('fs').readFileSync(dockerfilePath, 'utf8');
      
      // Should set user to non-root
      expect(dockerfileContent).toMatch(/USER\s+(?!root)\w+/i);
    });
  });

  describe('Docker Ignore Configuration', () => {
    it('should exclude node_modules from build context', () => {
      if (!existsSync(dockerignorePath)) {
        throw new Error('.dockerignore does not exist');
      }
      
      const dockerignoreContent = require('fs').readFileSync(dockerignorePath, 'utf8');
      expect(dockerignoreContent).toContain('node_modules');
    });

    it('should exclude development files from build context', () => {
      if (!existsSync(dockerignorePath)) {
        throw new Error('.dockerignore does not exist');
      }
      
      const dockerignoreContent = require('fs').readFileSync(dockerignorePath, 'utf8');
      
      const devFiles = ['.git', '*.md', 'test', 'src/test', '.env.local'];
      devFiles.forEach(file => {
        expect(dockerignoreContent).toContain(file);
      });
    });
  });

  describe('Production Docker Compose', () => {
    it('should have valid docker-compose.prod.yml structure', () => {
      if (!existsSync(dockerComposeProdPath)) {
        throw new Error('docker-compose.prod.yml does not exist');
      }
      
      const composeContent = require('fs').readFileSync(dockerComposeProdPath, 'utf8');
      
      // Basic YAML structure validation
      expect(composeContent).toMatch(/version:\s*['"]3\.\d+['"]?/);
      expect(composeContent).toContain('services:');
      expect(composeContent).toContain('app:');
    });

    it('should configure production environment variables', () => {
      if (!existsSync(dockerComposeProdPath)) {
        throw new Error('docker-compose.prod.yml does not exist');
      }
      
      const composeContent = require('fs').readFileSync(dockerComposeProdPath, 'utf8');
      
      // Should set NODE_ENV to production
      expect(composeContent).toMatch(/NODE_ENV.*production/);
    });

    it('should configure health checks', () => {
      if (!existsSync(dockerComposeProdPath)) {
        throw new Error('docker-compose.prod.yml does not exist');
      }
      
      const composeContent = require('fs').readFileSync(dockerComposeProdPath, 'utf8');
      
      // Should have healthcheck configuration
      expect(composeContent).toContain('healthcheck:');
    });
  });

  afterAll(() => {
    // Cleanup test image if it exists
    try {
      execSync('docker rmi the-social-backend:test 2>/dev/null || true');
    } catch (error) {
      // Ignore cleanup errors
    }
  });
}); 