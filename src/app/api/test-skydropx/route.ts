import { NextResponse } from 'next/server';

const SKYDROPX_CLIENT_ID = process.env.SKYDROPX_CLIENT_ID;
const SKYDROPX_CLIENT_SECRET = process.env.SKYDROPX_CLIENT_SECRET;

export async function GET() {
  console.log('=== TEST SKYDROPX BEARER TOKEN ===');
  console.log('Client ID:', SKYDROPX_CLIENT_ID?.substring(0, 10) + '...');
  console.log('Client Secret:', SKYDROPX_CLIENT_SECRET?.substring(0, 10) + '...');
  
  const results = [];
  
  // Probar directamente con Bearer token usando CLIENT_ID
  console.log('\n1. Probando Bearer con CLIENT_ID:');
  try {
    const response = await fetch('https://api.skydropx.com/v1/carriers', {
      headers: {
        'Authorization': `Bearer ${SKYDROPX_CLIENT_ID}`,
        'Accept': 'application/json'
      }
    });
    
    const responseText = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${responseText.substring(0, 200)}...`);
    
    results.push({
      method: 'Bearer CLIENT_ID',
      url: 'https://api.skydropx.com/v1/carriers',
      status: response.status,
      success: response.ok,
      response: responseText.substring(0, 200)
    });
    
    if (response.ok) {
      console.log('✅ ÉXITO con Bearer CLIENT_ID');
      return NextResponse.json({
        message: 'SUCCESS with Bearer CLIENT_ID',
        results,
        recommendation: 'Use Bearer token with CLIENT_ID'
      });
    }
    
  } catch (error) {
    console.log(`Error: ${error}`);
    results.push({
      method: 'Bearer CLIENT_ID',
      url: 'https://api.skydropx.com/v1/carriers',
      status: 'ERROR',
      success: false,
      response: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  // Probar con Token token= format
  console.log('\n2. Probando Token token= format:');
  try {
    const response = await fetch('https://api.skydropx.com/v1/carriers', {
      headers: {
        'Authorization': `Token token=${SKYDROPX_CLIENT_ID}`,
        'Accept': 'application/json'
      }
    });
    
    const responseText = await response.text();
    console.log(`Status: ${response.status}`);
    console.log(`Response: ${responseText.substring(0, 200)}...`);
    
    results.push({
      method: 'Token token=',
      url: 'https://api.skydropx.com/v1/carriers',
      status: response.status,
      success: response.ok,
      response: responseText.substring(0, 200)
    });
    
    if (response.ok) {
      console.log('✅ ÉXITO con Token token=');
      return NextResponse.json({
        message: 'SUCCESS with Token token=',
        results,
        recommendation: 'Use Token token= format'
      });
    }
    
  } catch (error) {
    console.log(`Error: ${error}`);
    results.push({
      method: 'Token token=',
      url: 'https://api.skydropx.com/v1/carriers',
      status: 'ERROR',
      success: false,
      response: error instanceof Error ? error.message : 'Unknown error'
    });
  }
  
  return NextResponse.json({
    message: 'All tests failed',
    results,
    recommendation: 'Check credentials and API documentation'
  });
}