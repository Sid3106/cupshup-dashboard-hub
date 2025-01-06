import { Resend } from 'npm:resend';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  vendor_name: string;
  vendor_email: string;
  brand: string;
  location: string;
  start_date: string;
  end_date: string;
  message: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const emailData: EmailRequest = await req.json();

    const { vendor_name, vendor_email, brand, location, start_date, end_date, message } = emailData;

    const startDate = new Date(start_date);
    const endDate = new Date(end_date);

    const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Activity Assigned</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f5f5f5;
          color: #333333;
          margin: 0;
          padding: 0;
        }
        .container {
          width: 100%;
          max-width: 600px;
          background-color: #ffffff;
          margin: 0 auto;
          padding: 20px;
          border-radius: 10px;
        }
        .logo {
          text-align: center;
          margin-bottom: 20px;
        }
        h1 {
          color: #00A979;
          text-align: center;
        }
        p {
          font-size: 16px;
          line-height: 1.5;
          text-align: center;
        }
        .cta-button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #00A979;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          font-size: 16px;
          margin-top: 20px;
        }
        .cta-button:hover {
          background-color: #008c63;
        }
        .details-block {
          background-color: #f0f0f0;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
        }
        .details-block h2 {
          color: #00A979;
          font-size: 18px;
          margin-bottom: 10px;
          text-align: center;
        }
        .details-block p {
          font-size: 14px;
          line-height: 1.6;
          color: #333;
        }
        footer {
          margin-top: 20px;
          text-align: center;
          font-size: 12px;
          color: #777777;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="logo">
          <img src="https://i.imgur.com/AwfabLV.png" alt="CupShup AI Logo" style="width: 100px;">
        </div>
        <h1>New Activity Alert, ${vendor_name}!</h1>
        <p>Hey ${vendor_name}! You've got something new to do. The CupShup team has assigned you a fresh activity! Ready to dive in?</p>
        <p>Click the button below to get started with your activity and let's make it awesome!</p>
        <div style="text-align: center;">
          <a href="https://cupshupai.glide.page" class="cta-button">Check Your Activity</a>
        </div>

        <div class="details-block">
          <h2>Project Details</h2>
          <p><strong>Brand:</strong> ${brand}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Start Time:</strong> ${startDate.toLocaleString()}</p>
          <p><strong>End Time:</strong> ${endDate.toLocaleString()}</p>
          <p><strong>Notes:</strong> ${message || 'No additional notes'}</p>
        </div>
        
        <footer>
          <p>&copy; 2024 CupShup AI. All rights reserved.</p>
        </footer>
      </div>
    </body>
    </html>
    `;

    const { data, error } = await resend.emails.send({
      from: 'CupShup AI <no-reply@cs.cupshup.ai>',
      to: [vendor_email],
      subject: `Hey ${vendor_name}, an activity has been assigned to you`,
      html: emailHtml,
    });

    if (error) {
      console.error('Error sending email:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-vendor-email function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});