"""Build Agent using Microsoft Agent Framework in Python
# Run this python script
> pip install anthropic agent-framework==1.0.0b260107 agent-framework-azure-ai==1.0.0b260107
> python <this-script-path>.py
"""

import asyncio
import os

from agent_framework import MCPStdioTool, MCPStreamableHTTPTool, ToolProtocol, FunctionCallContent
from agent_framework.azure import AzureAIClient
from agent_framework.openai import OpenAIChatClient
from openai import AsyncOpenAI
from azure.identity.aio import DefaultAzureCredential

# Microsoft Foundry Agent Configuration
ENDPOINT = "https://03coding-agent-test-resource.services.ai.azure.com/api/projects/03coding-agent-test"
MODEL_DEPLOYMENT_NAME = "gpt-5.4"

AGENT_NAME = "mcp-agent"
AGENT_INSTRUCTIONS = "Use the provided tools to answer questions. You have access to MCP tools for various functionalities."

# User inputs for the conversation
USER_INPUTS = [
    "tell me",
]

def create_mcp_tools() -> list[ToolProtocol]:
    return [
        MCPStdioTool(
            name="microsoft-clarity-mmsioyxt".replace("-", "_"),
            description="MCP server for microsoft-clarity-mmsioyxt",
            command="npx",
            args=[
                "-y",
                "@microsoft/clarity-mcp-server",
                "--clarity_api_token=${secret:microsoft-clarity-mmsioyxt.CLARITY_API_TOKEN}",
            ]
        ),
    ]

async def main() -> None:
    async with (
        # For authentication, DefaultAzureCredential supports multiple authentication methods. Run `az login` in terminal for Azure CLI auth.
        DefaultAzureCredential() as credential,
        AzureAIClient(
            project_endpoint=ENDPOINT,
            model_deployment_name=MODEL_DEPLOYMENT_NAME,
            credential=credential,
            agent_name=AGENT_NAME,
            use_latest_version=True,  # This parameter will allow to re-use latest agent version instead of creating a new one
        ).create_agent(
            instructions=AGENT_INSTRUCTIONS,
            tools=[
                *create_mcp_tools(),
            ],
        ) as agent
    ):
        # Process user messages
        for user_input in USER_INPUTS:
            print(f"\n# User: '{user_input}'")
            printed_tool_calls = set()
            async for chunk in agent.run_stream([user_input]):
                # log tool calls if any
                function_calls = [
                    c for c in chunk.contents 
                    if isinstance(c, FunctionCallContent)
                ]
                for call in function_calls:
                    if call.call_id not in printed_tool_calls:
                        print(f"Tool calls: {call.name}")
                        printed_tool_calls.add(call.call_id)
                if chunk.text:
                    print(chunk.text, end="")
            print("")
        
        print("\n--- All tasks completed successfully ---")

    # Give additional time for all async cleanup to complete
    await asyncio.sleep(1.0)

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nProgram interrupted by user")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        import traceback
        traceback.print_exc()
    finally:
        print("Program finished.")
